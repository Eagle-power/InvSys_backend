const express = require('express');
const router = express.Router();
const { createCustomer, getCustomers, updateCustomer, deleteCustomer } = require('../controllers/customerController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.route('/pos').get(protect, getCustomers);

router.route('/')
    .post(protect, createCustomer)
    .get(protect, getCustomers);

router.route('/:id')
    .put(protect, admin, updateCustomer)
    .delete(protect, admin, deleteCustomer);

module.exports = router;