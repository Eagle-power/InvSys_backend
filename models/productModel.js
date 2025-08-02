const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    sku: { // Stock Keeping Unit
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Category', // This now references the Category model
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      required: true, // Making it required for better data integrity
      ref: 'Supplier',
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    imageUrl: {
      type: String,
      required: false, // Optional image
    }
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;