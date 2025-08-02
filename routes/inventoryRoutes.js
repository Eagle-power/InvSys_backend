
const express = require('express');
const router = express.Router();
const { updateStock, getStoreInventory } = require('../controllers/inventoryController.js');
const { protect, admin, manager } = require('../middleware/authMiddleware.js');


// Route to update stock (add, set, or change quantity)
router.route('/').post(protect, admin, updateStock);

// Route to get all inventory for a specific store
// router.route('/:storeId').get(protect, admin, getStoreInventory);

router.route('/:storeId').get(protect, manager, getStoreInventory);


module.exports = router;
