const Customer = require('../models/customerModel.js');
const Sale = require('../models/saleModel.js');

const createCustomer = async (req, res) => {
    // The 'email' field might be undefined when called from the POS form
    const { name, email, phone, address } = req.body;

    try {
        // Only check for an existing email if a non-empty email was actually provided.
        if (email) {
            const customerExists = await Customer.findOne({ email });
            if (customerExists) {
                return res.status(400).json({ message: 'Customer with this email already exists' });
            }
        }

        // Proceed to create the customer. If email is undefined, it won't be saved.
        const customer = await Customer.create({ name, email, phone, address });
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getCustomers = async (req, res) => {
    try {
        const user = req.user;
        let customers;

        if (user.role === 'manager' || user.role === 'staff') {
            if (!user.assignedStore) {
                return res.json([]);
            }
            // 1. Find all sales that occurred at the user's store
            const salesInStore = await Sale.find({ store: user.assignedStore });
            // 2. Get the unique customer IDs from those sales
            const customerIds = [...new Set(salesInStore.map(sale => sale.customer))];
            // 3. Fetch only the customers who have shopped at this store
            customers = await Customer.find({ _id: { $in: customerIds } });
        } else {
            // Admins can see all customers
            customers = await Customer.find({});
        }
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            customer.name = req.body.name || customer.name;
            customer.email = req.body.email || customer.email;
            customer.phone = req.body.phone || customer.phone;
            customer.address = req.body.address || customer.address;
            const updatedCustomer = await customer.save();
            res.json(updatedCustomer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (customer) {
            // Note: In a real system, you might want to check if the customer has sales history before deleting.
            // For now, we will allow direct deletion.
            await customer.deleteOne();
            res.json({ message: 'Customer removed' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createCustomer, getCustomers, updateCustomer, deleteCustomer };
