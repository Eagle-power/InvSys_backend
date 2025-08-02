const mongoose = require('mongoose');

const restockRequestSchema = mongoose.Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
        store: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Store' },
        requestedBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        quantityRequested: { type: Number, required: true },
        notes: { type: String },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        },
    },
    { timestamps: true }
);

const RestockRequest = mongoose.model('RestockRequest', restockRequestSchema);
module.exports = RestockRequest;