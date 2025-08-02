const Inventory = require('../models/inventoryModel');

// Update stock quantity for a product in a store

const updateStock = async (req, res) => {
  const { productId, storeId, quantity } = req.body;

  try {
    if (!productId || !storeId || quantity === undefined) {
      res.status(400);
      throw new Error('Please provide productId, storeId, and quantity');
    }

    // Find the inventory item for the specific product and store
    // and update its quantity. If it doesn't exist, create it (upsert: true).
    const inventoryItem = await Inventory.findOneAndUpdate(
      { product: productId, store: storeId },
      { $set: { quantity: quantity } },
      { new: true, upsert: true } // 'new: true' returns the updated doc, 'upsert: true' creates it if it doesn't exist
    ).populate('product', 'name sku').populate('store', 'name');

    res.status(200).json(inventoryItem);
  } catch (error) {
    res.status(res.statusCode || 500).json({ message: error.message });
  }
};


// Get all inventory for a specific store

const getStoreInventory = async (req, res) => {
    try {
        const storeInventory = await Inventory.find({ store: req.params.storeId })
            .populate('product', 'name sku price')
            .populate('store', 'name location');
            // console.log("Store Inventory" , storeInventory)
            
        res.json(storeInventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
  updateStock,
  getStoreInventory,
};