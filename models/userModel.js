const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
        },
        email: {
            type: String,
            require: true,
            unique: true   // Email will be unique .
        },
        password: {
            type: String,
            require: true,
        },
        role: {
            type: String,
            require: true,
            enum: ['admin', 'manager', 'staff'],
            default: 'staff',
        },
        assignedStore: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
        },
        bio: {
            type: String,
            default: '',
        },
        profilePictureUrl: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    // generating a salt & hash password if it has been modified..
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        return next(err);
    }
});

//  Method to match entered password with the hashed password in the DB

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;