const express = require('express');
const router = express.Router();
const { generateDescription, generateCategoryDescription } = require('../controllers/geminiController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.post('/generate-description', protect, admin, generateDescription);
router.post('/generate-category-description', protect , admin , generateCategoryDescription)

module.exports = router;