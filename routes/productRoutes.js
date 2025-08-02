const express = require('express');
const router = express.Router();
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} = require('../controllers/productController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// fetch products for the pos 
router.route('/pos').get(protect, getProducts);

// Routes for /api/products
router.route('/')
    .post(protect, admin, createProduct)
    .get(protect, admin, getProducts);

// Routes for /api/products/:id
router.route('/:id')
    .get(protect, admin, getProductById)
    .put(protect, admin, updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;