const mongoose = require('mongoose');

const customerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: false, // Email is optional
      //Enforce a valid email format if a value is provided.
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address'
      ]
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Customer = mongoose.model('Customer', customerSchema);
module.exports = Customer;