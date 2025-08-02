const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPaymentAndCreateSale } = require('../controllers/paymentController.js');
const { protect } = require('../middleware/authMiddleware.js');

router.post('/orders', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPaymentAndCreateSale);

module.exports = router;
