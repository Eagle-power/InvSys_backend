const express = require('express');
const router = express.Router();
const { createSale, getSalesHistory, getSaleById } = require('../controllers/saleController.js');
const { protect } = require('../middleware/authMiddleware.js');

// Anyone who is logged in can create a sale
router.route('/').post(protect, createSale).get(protect , getSalesHistory);

// Anyone logged in can view sales history for a store
router.route('/:storeId').get(protect, getSalesHistory);

// New route to get a single sale (bill) by its ID
router.route('/:id').get(protect, getSaleById);

module.exports = router;