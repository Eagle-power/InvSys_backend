const RestockRequest = require('../models/restockRequestModel.js');
const Inventory = require('../models/inventoryModel.js');
const mongoose = require('mongoose');

const createRestockRequest = async (req, res) => {
    const { productId, quantityRequested, notes } = req.body;
    const user = req.user;
    try {
        const request = await RestockRequest.create({
            product: productId,
            store: user.assignedStore,
            requestedBy: user._id,
            quantityRequested,
            notes,
        });
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRestockRequests = async (req, res) => {
    try {
        const user = req.user;
        let query = {};
        if (user.role === 'manager') {
            if (!user.assignedStore) return res.json([]);
            query = { store: user.assignedStore };
        }
        const requests = await RestockRequest.find(query)
            .populate('product', 'name sku')
            .populate('store', 'name')
            .populate('requestedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- START OF CORRECTED FUNCTION ---
const updateRestockRequest = async (req, res) => {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const request = await RestockRequest.findById(requestId).session(session);

        if (!request) {
            res.status(404);
            throw new Error('Restock request not found');
        }

        if (request.status !== 'Pending') {
            res.status(400);
            throw new Error(`Request has already been ${request.status.toLowerCase()}`);
        }

        request.status = status;

        if (status === 'Approved') {
            // Use findOneAndUpdate with upsert to handle cases where inventory record might not exist
            await Inventory.findOneAndUpdate(
                { product: request.product, store: request.store },
                { $inc: { quantity: request.quantityRequested } },
                { upsert: true, new: true, session: session }
            );
        }

        await request.save({ session });
        await session.commitTransaction();
        res.json({ message: `Request has been ${status.toLowerCase()}` });

    } catch (error) {
        await session.abortTransaction();
        res.status(res.statusCode || 500).json({ message: error.message });
    } finally {
        session.endSession();
    }
};
// --- END OF CORRECTED FUNCTION ---

module.exports = { createRestockRequest, getRestockRequests, updateRestockRequest };
