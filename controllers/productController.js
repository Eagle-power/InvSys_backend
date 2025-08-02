// const mongoose = require('mongoose');
// const Product = require('../models/productModel.js');
// const Inventory = require('../models/inventoryModel.js');

// const createProduct = async (req, res) => {
//     // Now expecting 'category' to be an ID
//     const { name, sku, description, category, price } = req.body;

//     try {
//         const productExists = await Product.findOne({ sku });
//         if (productExists) {
//             res.status(400);
//             throw new Error('Product with this SKU already exists');
//         }

//         const product = new Product({ name, sku, description, category, price });
//         const createdProduct = await product.save();
//         res.status(201).json(createdProduct);
//     } catch (error) {
//         res.status(res.statusCode || 500).json({ message: error.message });
//     }
// };

// const getProducts = async (req, res) => {
//     try {
//         // Populate the category field to get the category's name
//         const products = await Product.find({}).populate('category', 'name');
//         res.json(products);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// const getProductById = async (req, res) => {
//     try {
//         const product = await Product.findById(req.params.id).populate('category', 'name');
//         if (product) {
//             res.json(product);
//         } else {
//             res.status(404);
//             throw new Error('Product not found');
//         }
//     } catch (error) {
//         res.status(res.statusCode || 500).json({ message: error.message });
//     }
// };

// const updateProduct = async (req, res) => {
//     const { name, sku, description, category, price } = req.body;
//     try {
//         const product = await Product.findById(req.params.id);
//         if (product) {
//             product.name = name || product.name;
//             product.sku = sku || product.sku;
//             product.description = description || product.description;
//             product.category = category || product.category;
//             product.price = price !== undefined ? price : product.price;

//             const updatedProduct = await product.save();
//             res.json(updatedProduct);
//         } else {
//             res.status(404);
//             throw new Error('Product not found');
//         }
//     } catch (error) {
//         res.status(res.statusCode || 500).json({ message: error.message });
//     }
// };

// const deleteProduct = async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     try {
//         const product = await Product.findById(req.params.id).session(session);
//         if (product) {
//             await Inventory.deleteMany({ product: product._id }, { session });
//             await product.deleteOne({ session });
//             await session.commitTransaction();
//             session.endSession();
//             res.json({ message: 'Product and associated inventory removed' });
//         } else {
//             res.status(404);
//             throw new Error('Product not found');
//         }
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();
//         res.status(res.statusCode || 500).json({ message: error.message });
//     }
// };

// module.exports = {
//     createProduct,
//     getProducts,
//     getProductById,
//     updateProduct,
//     deleteProduct,
// };


const mongoose = require('mongoose');
const Product = require('../models/productModel.js');
const Inventory = require('../models/inventoryModel.js');

const createProduct = async (req, res) => {
    // Now expecting 'supplier' to be an ID
    const { name, sku, description, category, supplier, price } = req.body;

    try {
        const productExists = await Product.findOne({ sku });
        if (productExists) {
            res.status(400);
            throw new Error('Product with this SKU already exists');
        }

        const product = new Product({ name, sku, description, category, supplier, price });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};

// const getProducts = async (req, res) => {
//     try {
//         const user = req.user;
//         let products;

//         // If the user is not an admin, filter products based on their store's inventory
//         if (user.role === 'manager' || user.role === 'staff') {
//             if (!user.assignedStore) {
//                 return res.json([]); // Return empty if not assigned to a store
//             }
//             // 1. Find all inventory items for the user's store
//             const inventoryItems = await Inventory.find({ store: user.assignedStore });
//             // 2. Extract the product IDs from those inventory items
//             const productIds = inventoryItems.map(item => item.product);
//             // 3. Fetch only the products that are in the store's inventory
//             products = await Product.find({ _id: { $in: productIds } })
//                 .populate('category', 'name')
//                 .populate('supplier', 'name');
//         } else {
//             // Admins can see all products
//             products = await Product.find({})
//                 .populate('category', 'name')
//                 .populate('supplier', 'name');
//         }
//         res.json(products);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

const getProducts = async (req, res) => {
    try {
        const user = req.user;
        let products;

        if (user.role === 'manager' || user.role === 'staff') {
            if (!user.assignedStore) {
                return res.json([]);
            }
            // Find all inventory items for the user's store that have a quantity GREATER THAN 0
            const inventoryItems = await Inventory.find({
                store: user.assignedStore,
                quantity: { $gt: 0 } // <-- THE FIX IS HERE
            });
            const productIds = inventoryItems.map(item => item.product);
            products = await Product.find({ _id: { $in: productIds } })
                .populate('category', 'name')
                .populate('supplier', 'name');
        } else {
            // Admins can see all products
            products = await Product.find({})
                .populate('category', 'name')
                .populate('supplier', 'name');
        }
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .populate('supplier', 'name');
        if (product) {
            res.json(product);
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};

const updateProduct = async (req, res) => {
    const { name, sku, description, category, supplier, price } = req.body;
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            product.name = name || product.name;
            product.sku = sku || product.sku;
            product.description = description || product.description;
            product.category = category || product.category;
            product.supplier = supplier || product.supplier;
            product.price = price !== undefined ? price : product.price;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const product = await Product.findById(req.params.id).session(session);
        if (product) {
            await Inventory.deleteMany({ product: product._id }, { session });
            await product.deleteOne({ session });
            await session.commitTransaction();
            session.endSession();
            res.json({ message: 'Product and associated inventory removed' });
        } else {
            res.status(404);
            throw new Error('Product not found');
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};
