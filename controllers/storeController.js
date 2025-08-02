const Store = require('../models/storeModel.js');

const createStore = async (req, res) => {
    const { name, location } = req.body;

    try {
        const storeExist = await Store.findOne({ name });
        if (storeExist) {
            return res.status(400).json({ message: 'Store with this name already exists' });
        }
        const storeCount = await Store.countDocuments();
        const nextNumber = storeCount + 1;
        const formattedNumber = String(nextNumber).padStart(3, '0');
        const storeCode = `S_${formattedNumber}`;

        // Create the store without a manager initially
        const store = new Store({
            name,
            location,
            storeCode,
        });
    
        const createdStore = await store.save();
        res.status(201).json(createdStore);
    } catch (error) {
        res.status(500).json({
            message: error.message || "Something went wrong while creating store"
        });
    }
}
const getStore = async (req, res) => {
    try {
        const stores = await Store.find({}).populate('manager', 'name email');
        res.status(200).json(stores);
    } catch (error) {
        res.status(500).json({
            message: error.message || "Error while getting stores"
        });
    }
};

const getStoreById = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id).populate('manager', 'name email');
        if (store) {
            res.json(store);
        } else {
            res.status(404);
            throw new Error('Store not found');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};


const updateStore = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);

        if (store) {
            store.name = req.body.name || store.name;
            store.location = req.body.location || store.location;

            // store.manager = req.body.manager || store.manager;

            const updatedStore = await store.save();
            res.json(updatedStore);
        } else {
            res.status(404);
            throw new Error('Store not found');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};

const deleteStore = async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);

        if (store) {
            await store.deleteOne();
            res.json({ message: 'Store removed Successfully' });
        } else {
            res.status(404);
            throw new Error('Store not found');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};



module.exports = {
    createStore,
    getStore,
    getStoreById,
    updateStore,
    deleteStore,
};