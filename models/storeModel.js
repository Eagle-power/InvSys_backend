const mongoose = require('mongoose');

const storeSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        storeCode: {
            type: String,
            required: true,
            unique: true,
        },
        location: {
            type: String,
            required: true,
        },
        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Store = mongoose.model('Store', storeSchema);
module.exports = Store;