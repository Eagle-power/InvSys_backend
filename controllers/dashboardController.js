const Sale = require('../models/saleModel.js');
const Customer = require('../models/customerModel.js');
const Product = require('../models/productModel.js');
const mongoose = require('mongoose');

const getDashboardStats = async (req, res) => {
    try {
        const user = req.user;
        let matchQuery = {}; // Start with an empty query

        // --- START OF NEW LOGIC ---
        // If the user is not an admin, filter all queries by their assigned store
        if (user.role === 'manager' || user.role === 'staff') {
            if (!user.assignedStore) {
                return res.status(403).json({ message: 'User is not assigned to a store.' });
            }
            // Convert string ID to ObjectId for matching
            matchQuery = { store: new mongoose.Types.ObjectId(user.assignedStore) };
        }
        // --- END OF NEW LOGIC ---

        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // --- KPIs ---
        const totalRevenueResult = await Sale.aggregate([
            { $match: matchQuery },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const salesTodayResult = await Sale.aggregate([
            { $match: { ...matchQuery, createdAt: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        // Global stats for admin, store-specific for others
        const totalSales = await Sale.countDocuments(matchQuery);
        // Customer and Product counts are always global for simplicity on the dashboard
        const totalCustomers = await Customer.countDocuments();
        const totalProducts = await Product.countDocuments();
        const newCustomersThisMonth = await Customer.countDocuments({ createdAt: { $gte: startOfMonth } });

        // --- Charts ---
        const salesLast7Days = await Sale.aggregate([
            { $match: { ...matchQuery, createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, totalAmount: { $sum: "$totalAmount" } } },
            { $sort: { _id: 1 } }
        ]);

        const topSellingProducts = await Sale.aggregate([
            { $match: matchQuery },
            { $unwind: '$items' },
            { $group: { _id: '$items.name', totalQuantity: { $sum: '$items.quantity' } } },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 }
        ]);

        // --- Recent Activity ---
        const recentSales = await Sale.find(matchQuery)
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customer', 'name')
            .populate('store', 'name');

        res.json({
            kpis: {
                totalRevenue: totalRevenueResult[0]?.total || 0,
                salesToday: salesTodayResult[0]?.total || 0,
                totalSales,
                totalCustomers,
                newCustomersThisMonth,
                totalProducts, // Added for admin view
            },
            salesLast7Days,
            topSellingProducts,
            recentSales,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };