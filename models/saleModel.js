const mongoose = require('mongoose');
const Counter = require('./counterModel');

const saleSchema = mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      unique: true,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Store',
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          required: true,
        },
        // We store the price at the time of sale, in case the product's master price changes later
        price: {
          type: Number,
          required: true,
        },
        name: { // For easier reporting
          type: String,
          required: true,
        },
        sku: { // For easier reporting
          type: String,
          required: true,
        }
      },
    ],
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Cash', 'Card', 'UPI', 'Other'],
      default: 'Card',
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  {
    timestamps: true,
  }
);

saleSchema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'invoiceNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const seqStr = String(counter.seq).padStart(4, '0');
    this.invoiceNumber = `INV-${seqStr}`;
  }
  next();
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;