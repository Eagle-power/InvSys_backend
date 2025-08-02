
const mongoose = require('mongoose');

const inventorySchema = mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Product', // Links to the Product model
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Store', // Links to the Store model
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    // Optional: Set a re-order level for low-stock alerts later
    reorderLevel: {
        type: Number,
        required : true,
        default: 10,
    }
  },
  {
    timestamps: true,
  }
);

// This ensures that the combination of product and store is unique.
// You cannot have more than one inventory document for the same product in the same store.
inventorySchema.index({ product: 1, store: 1 }, { unique: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;