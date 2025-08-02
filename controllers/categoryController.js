const Category = require('../models/categoryModel.js');

const createCategory = async (req, res) => {
  const { name, description, parentCategory, isActive } = req.body;
  try {
    // console.log('Received update data:', req.body);
    if (await Category.findOne({ name })) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    const category = await Category.create({
      name,
      description,
      parentCategory: parentCategory || null, // Set to null if not provided
      isActive
    });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategories = async (req, res) => {
  try {
    // We can populate the parent category to see its name
    const categories = await Category.find({}).populate('parentCategory', 'name');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      category.name = req.body.name || category.name;
      category.description = req.body.description || category.description;
      category.parentCategory = req.body.parentCategory || category.parentCategory;
      // Check if isActive is explicitly passed, otherwise don't change it
      if (req.body.isActive !== undefined) {
        category.isActive = req.body.isActive;
      }
      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      // Add a check to prevent deleting a category if it has sub-categories
      const subCategories = await Category.countDocuments({ parentCategory: category._id });
      if (subCategories > 0) {
        res.status(400);
        throw new Error('Cannot delete category with active sub-categories.');
      }
      await category.deleteOne();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};

module.exports = { createCategory, getCategories, updateCategory, deleteCategory };