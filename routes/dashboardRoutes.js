const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController.js');
const { protect } = require('../middleware/authMiddleware.js'); // We'll create a manager middleware next

router.route('/stats').get(protect, getDashboardStats);

module.exports = router;
