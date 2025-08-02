const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    // For creating nested categories (e.g., Electronics > Laptops)
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // This references itself
      default: null,
    },
    // To allow admins to enable/disable categories
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;