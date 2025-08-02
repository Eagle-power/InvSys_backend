const express = require('express');
const router = express.Router();
const { createStore, getStore, getStoreById, updateStore, deleteStore } = require('../controllers/storeController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

// For routes that need admin access, we apply both middleware
router.post('/', protect, admin, createStore); // Only logged-in admins can create
router.get('/', protect, admin, getStore);      // Only logged-in admins can view all
router.route('/:id').get(protect , admin , getStoreById)
                    .put(protect , admin , updateStore)
                    .delete(protect ,  admin , deleteStore);

module.exports = router;