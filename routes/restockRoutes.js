const express = require('express');
const router = express.Router();
const { createRestockRequest, getRestockRequests, updateRestockRequest } = require('../controllers/restockController.js');
const { protect, admin, manager } = require('../middleware/authMiddleware.js');




// Only managers and admins can create a request
router.post('/', protect, manager, createRestockRequest);

// Only admins can view all requests
router.get('/', protect, manager, getRestockRequests);

// Only admins can update the status of a request
router.put('/:requestId', protect, admin, updateRestockRequest);

module.exports = router;