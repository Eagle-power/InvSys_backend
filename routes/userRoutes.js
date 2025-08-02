// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers, getUserById, updateUser, deleteUser, updateUserProfile, changePassword } = require('../controllers/userController.js');
const { protect, admin } = require('../middleware/authMiddleware.js');
const upload = require('../config/cloudinary.js');


// Route for registering a new user
router.post('/register', registerUser);
router.post('/login', loginUser);

router.put('/profile', protect, upload.single('profilePicture'), updateUserProfile);
router.put('/change-password', protect, changePassword);


// Admin routes
router.route('/')
    .get(protect, admin, getUsers);

router.route('/:id')
    .get(protect, admin, getUserById)
    .put(protect, admin, updateUser)
    .delete(protect, admin, deleteUser);



router.get('/profile', protect, (req, res) => { res.status(200).json(req.user); });

module.exports = router;