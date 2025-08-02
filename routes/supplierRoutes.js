const express = require('express');
const router = express.Router();
const { createSupplier, getSuppliers, updateSupplier, deleteSupplier } = require('../controllers/supplierController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.route('/')
    .post(protect, admin, createSupplier)
    .get(protect, admin, getSuppliers);

router.route('/:id')
    .put(protect, admin, updateSupplier)
    .delete(protect, admin, deleteSupplier);

module.exports = router;
