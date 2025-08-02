const mongoose = require('mongoose');
const Sale = require('../models/saleModel.js');
const Inventory = require('../models/inventoryModel.js');
const Product = require('../models/productModel.js');

const createSale = async (req, res) => {
  // This function remains unchanged
  const { storeId, items, customerId } = req.body;
  const staffId = req.user._id;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let totalAmount = 0;
    const saleItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) throw new Error(`Product with ID ${item.productId} not found`);
      const inventoryItem = await Inventory.findOne({ product: item.productId, store: storeId }).session(session);
      if (!inventoryItem || inventoryItem.quantity < item.quantity) throw new Error(`Not enough stock for product: ${product.name}`);
      inventoryItem.quantity -= item.quantity;
      await inventoryItem.save({ session });
      saleItems.push({ product: item.productId, quantity: item.quantity, price: product.price, name: product.name, sku: product.sku });
      totalAmount += product.price * item.quantity;
    }
    const sale = new Sale({ store: storeId, staff: staffId, items: saleItems, totalAmount, customer: customerId });
    await sale.save({ session });
    await session.commitTransaction();
    res.status(201).json(sale);
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

const getSalesHistory = async (req, res) => {
  try {
    const user = req.user;
    let query = {};

    // If the user is a Manager OR Staff, they can only see sales for their assigned store.
    if (user.role === 'manager' || user.role === 'staff') {
      if (!user.assignedStore) {
        return res.json([]); // Return empty array if not assigned to a store
      }
      query.store = user.assignedStore;
    }
    // If an Admin provides a storeId in the query, filter by that store.
    else if (user.role === 'admin' && req.query.storeId) {
      query.store = req.query.storeId;
    }

    const sales = await Sale.find(query)
      .populate('staff', 'name')
      .populate('customer', 'name phone')
      .populate('store', 'name')
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('staff', 'name')
      .populate('customer', 'name phone email address')
      .populate('store', 'name location storeCode');

    if (sale) {
      // Security check: A manager or staff can only see bills from their own store
      if ((req.user.role === 'manager' || req.user.role === 'staff') && String(sale.store._id) !== String(req.user.assignedStore)) {
        return res.status(403).json({ message: 'Not authorized to view this sale' });
      }
      res.json(sale);
    } else {
      res.status(404).json({ message: 'Sale not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSale, getSalesHistory, getSaleById };
