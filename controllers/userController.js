const mongoose = require('mongoose');
const User = require('../models/userModel.js');

const jwt = require('jsonwebtoken');
const Store = require('../models/storeModel.js');

// helper function to generate jwt...
const generateToken = (id) => {
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExist = await User.findOne({ email });

        if (userExist) {
            res.status(400); // Bad request
            throw new Error('User Already Exist , Please User another Email');
        }

        const user = await User.create({
            name,
            email,
            password,

        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                bio: user.bio,
                profilePictureUrl: user.profilePictureUrl,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid User data');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({
            message: "Something went wrong while Registering" || error.message
        });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // find user by email..
        const user = await User.findOne({ email }).populate('assignedStore', 'name');

        // check validations..
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                assignedStore: user.assignedStore,
                bio: user.bio,
                profilePictureUrl: user.profilePictureUrl,
                token: generateToken(user._id),
            });

        } else {
            res.status(401);
            throw new Error('Please check Entered Credentials...')
        }
    } catch (error) {
        console.log(error);
        // console.log(statusCode);
        res.status(res.statusCode || 500).json({
            message: error.message

        })
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').populate('assignedStore', 'name');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password').populate('assignedStore', 'name');
        if (user) {
            res.json(user);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(req.params.id).session(session);

        if (user) {
            const oldAssignedStoreId = user.assignedStore;
            const newAssignedStoreId = req.body.assignedStore || null;

            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.assignedStore = newAssignedStoreId;

            if (req.body.password) {
                res.status(400);
                throw new Error('Password cannot be updated from this route.');
            }

            const updatedUser = await user.save({ session });

            if (String(oldAssignedStoreId) !== String(newAssignedStoreId)) {

                // --- START OF THE FIX ---
                // Remove manager from the old store, ONLY if the manager is this user.
                if (oldAssignedStoreId) {
                    await Store.updateOne(
                        { _id: oldAssignedStoreId, manager: user._id }, // Condition: Find the store where this user is the manager
                        { $unset: { manager: "" } }, // Action: Remove the manager field
                        { session }
                    );
                }
                // --- END OF THE FIX ---

                // Add manager to the new store, if it exists
                if (newAssignedStoreId) {
                    await Store.findByIdAndUpdate(newAssignedStoreId, { manager: user._id }, { session });
                }
            }

            await session.commitTransaction();
            session.endSession();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                assignedStore: updatedUser.assignedStore,
            });

        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};


const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            if (user.role === 'SuperAdmin') {
                res.status(400);
                throw new Error('Cannot delete Super Admin user');
            }
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Check if the new email is already taken by another user
            if (req.body.email && req.body.email !== user.email) {
                const userExists = await User.findOne({ email: req.body.email });
                if (userExists) {
                    res.status(400);
                    throw new Error('Email is already in use by another account.');
                }
            }

            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;

            if (req.file) {
                user.profilePictureUrl = req.file.path;
            }

            const updatedUser = await user.save();

            // We need to populate assignedStore to send the full object back
            await updatedUser.populate('assignedStore', 'name');

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                assignedStore: updatedUser.assignedStore,
                bio: updatedUser.bio,
                profilePictureUrl: updatedUser.profilePictureUrl,
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};

// Change user password

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user._id);

        if (user && (await user.matchPassword(currentPassword))) {
            user.password = newPassword; // The pre-save hook will hash it
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401);
            throw new Error('Invalid current password');
        }
    } catch (error) {
        res.status(res.statusCode || 500).json({ message: error.message });
    }
};


module.exports = {
    registerUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    updateUserProfile,
    changePassword
};