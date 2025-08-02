const express = require('express');
const router = express.Router();
const { createCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');

router.route('/')
    .post(protect, admin, createCategory)
    .get(protect, admin, getCategories);

router.route('/:id')
    .put(protect, admin, updateCategory)
    .delete(protect, admin, deleteCategory);

module.exports = router;