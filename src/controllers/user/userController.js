const jwt = require('jsonwebtoken');
const User = require('../../models/user/userModel');
const { validationResult } = require('express-validator');

// التسجيل
const registerUser = async (req, res) => {
    try {
        const { email, mobile, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.fail('Email already exists');
        }

        const user = new User({ email, mobile, password });
        await user.save();

        return res.success({ message: 'User registered successfully!' });
    } catch (err) {
        return res.error('Error registering user: ' + err.message, 500);
    }
};

// تسجيل الدخول
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.fail('Invalid email or password');
        }

        if (user.accountLocked) {
            return res.fail('Your account is locked due to multiple failed login attempts.', 403);
        }

        const isPasswordValid = await user.isValidPassword(password);

        if (!isPasswordValid) {
            await user.incrementFailedLoginAttempts();
            return res.fail('Invalid email or password');
        }

        await user.updateLastLogin();

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        user.tokens.push(token);
        await user.save();

        res.cookie('token', token, {
            maxAge: 3600000,
            httpOnly: true,
            secure: false,
        });

        return res.success({
            message: 'Login successful',
            data: {
                userId: user._id,
                mobile: user.mobile,
                email: user.email,
                role: user.role,
                balance: user.balance,
                token
            }
        });
    } catch (err) {
        return res.error('Error logging in: ' + err.message, 500);
    }
};

// الحصول على الملف الشخصي
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.fail('User ID not found in request');
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.fail('User not found', 404);
        }

        return res.success({ data: user });
    } catch (error) {
        return res.error('Server error while fetching profile: ' + error.message, 500);
    }
};

// تحديث الملف الشخصي
const updateUserProfile = async (req, res) => {
    try {
        const { email, mobile, password, currentPassword } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.fail('User not found', 404);
        }

        if (currentPassword && !(await user.isValidPassword(currentPassword))) {
            return res.fail('Incorrect current password');
        }

        user.email = email || user.email;
        user.mobile = mobile || user.mobile;
        user.password = password || user.password;

        await user.save();

        return res.success({ message: 'Profile updated successfully' });
    } catch (err) {
        return res.error('Error updating profile: ' + err.message, 500);
    }
};

// تسجيل الخروج
const logoutUser = async (req, res) => {
    try {
        if (!req.token) {
            return res.fail('Authorization token is missing', 401);
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.fail('User not found', 404);
        }

        if (!user.tokens.includes(req.token)) {
            return res.fail('Token mismatch, unable to logout', 401);
        }

        user.tokens = user.tokens.filter(token => token !== req.token);
        await user.save();

        return res.success({ message: 'Logout successful' });
    } catch (err) {
        return res.error('Error logging out: ' + err.message, 500);
    }
};

// تسجيل الخروج من كل الأجهزة
const logoutAllUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.fail('User not found', 404);
        }

        user.tokens = [];
        await user.save();

        return res.success({ message: 'Logged out from all devices' });
    } catch (err) {
        return res.error('Error logging out from all devices: ' + err.message, 500);
    }
};

// حذف الحساب
const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.fail('User not found', 404);
        }

        await user.deleteOne();
        return res.success({ message: 'Account deleted successfully' });
    } catch (err) {
        return res.error('Error deleting account: ' + err.message, 500);
    }
};

// فك قفل الحساب
const unlockUserAccount = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.fail('User not found', 404);
        }

        if (!user.accountLocked) {
            return res.fail('Account is not locked');
        }

        user.accountLocked = false;
        user.failedLoginAttempts = 0;
        user.lockUntil = null;

        await user.save();
        return res.success({ message: 'Account unlocked successfully' });
    } catch (err) {
        return res.error('Error unlocking account: ' + err.message, 500);
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    logoutUser,
    logoutAllUser,
    deleteAccount,
    unlockUserAccount,
};
