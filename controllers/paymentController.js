const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Sale = require('../models/saleModel.js');
const Inventory = require('../models/inventoryModel.js');
const Product = require('../models/productModel.js');

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// This function creates the order on Razorpay's servers
const createRazorpayOrder = async (req, res) => {
    try {
        const options = {
            amount: req.body.amount * 100, // amount in the smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_order_${new Date().getTime()}`,
        };
        const order = await instance.orders.create(options);
        if (!order) return res.status(500).send("Some error occured");
        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
};

// This function runs AFTER the user pays. It verifies the payment and then creates our sale.
const verifyPaymentAndCreateSale = async (req, res) => {
    const {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        saleData,
    } = req.body;

    const sha = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    sha.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = sha.digest("hex");

    if (digest !== razorpaySignature) {
        return res.status(400).json({ message: "Transaction not legit!" });
    }

    // If signature is legit, now we create the sale in our database
    const { storeId, items, customerId } = saleData;
    const staffId = req.user._id;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {

        let totalAmount = 0;
        const saleItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId).session(session);
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }

            const inventoryItem = await Inventory.findOne({
                product: item.productId,
                store: storeId,
            }).session(session);

            if (!inventoryItem || inventoryItem.quantity < item.quantity) {
                throw new Error(`Not enough stock for product: ${product.name}`);
            }

            inventoryItem.quantity -= item.quantity;
            await inventoryItem.save({ session });

            saleItems.push({
                product: item.productId,
                quantity: item.quantity,
                price: product.price,
                name: product.name,
                sku: product.sku,
            });

            totalAmount += product.price * item.quantity;
        }
        // --- END OF FULL TRANSACTIONAL LOGIC ---

        const newSale = new Sale({
            store: storeId,
            staff: staffId,
            customer: customerId,
            totalAmount: totalAmount, // Use the calculated total
            items: saleItems,
            paymentStatus: 'Completed',
            paymentMethod: 'Card', // Defaulting to Card for Razorpay
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
        });

        const createdSale = await newSale.save({ session });

        await session.commitTransaction();
        res.status(201).json({
            message: "Sale created successfully!",
            sale: createdSale,
        });
    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

module.exports = { createRazorpayOrder, verifyPaymentAndCreateSale };
