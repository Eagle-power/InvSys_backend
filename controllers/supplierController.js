const Supplier = require('../models/supplierModel.js');

const createSupplier = async (req, res) => {
  const { name, contactPerson, email, phone } = req.body;
  try {
    if (await Supplier.findOne({ email })) {
      return res.status(400).json({ message: 'Supplier with this email already exists' });
    }
    const supplier = await Supplier.create({ name, contactPerson, email, phone });
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({});
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (supplier) {
      supplier.name = req.body.name || supplier.name;
      supplier.contactPerson = req.body.contactPerson || supplier.contactPerson;
      supplier.email = req.body.email || supplier.email;
      supplier.phone = req.body.phone || supplier.phone;
      const updatedSupplier = await supplier.save();
      res.json(updatedSupplier);
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (supplier) {
      // Note: In a real system, you might first check if this supplier is linked to any products.
      await supplier.deleteOne();
      res.json({ message: 'Supplier removed' });
    } else {
      res.status(404).json({ message: 'Supplier not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSupplier, getSuppliers, updateSupplier, deleteSupplier };