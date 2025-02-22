const jwt = require('jsonwebtoken');
const User = require('../../models/user/userModel');
const { validationResult } = require('express-validator');
const jsend = require('jsend');  // استخدام مكتبة jsend لتوحيد الاستجابات

// التسجيل
const registerUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(jsend.error({ errors: errors.array() }));
    }

    const { email, mobile, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json(jsend.error({ message: 'Email already exists' }));
        }

        const user = new User({ email, mobile, password });
        await user.save();
        return res.status(201).json(jsend.success({ message: 'User registered successfully!' }));
    } catch (err) {
        return res.status(500).json(jsend.error({ message: 'Error registering user', error: err.message }));
    }
};

// تسجيل الدخول
const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(jsend.error({ errors: errors.array() }));
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json(jsend.error({ message: 'Invalid email or password' }));
        }

        // إذا كان الحساب مغلقًا بسبب المحاولات الفاشلة
        if (user.accountLocked) {
            return res.status(403).json(jsend.error({ message: 'Your account is locked due to multiple failed login attempts.' }));
        }

        const isPasswordValid = await user.isValidPassword(password);
        if (!isPasswordValid) {
            await user.incrementFailedLoginAttempts(); // زيادة المحاولات الفاشلة
            return res.status(400).json(jsend.error({ message: 'Invalid email or password' }));
        }

        // تسجيل الدخول بنجاح
        await user.updateLastLogin(); // تحديث آخر تسجيل دخول وإعادة تعيين المحاولات الفاشلة

        // توليد توكن JWT عند نجاح عملية تسجيل الدخول
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        // حفظ التوكن في قاعدة البيانات
        user.tokens.push(token);
        await user.save();

        return res.status(200).json(jsend.success({
            message: 'Login successful',
            token: token,
            userId: user._id,
            mobile: user.mobile,
            email: user.email,
            role: user.role,
            balance: user.balance
        }));

    } catch (err) {
        return res.status(500).json(jsend.error({ message: 'Error logging in', error: err.message }));
    }
};

// الحصول على الملف الشخصي للمستخدم
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(400).json(jsend.error({ message: 'User ID not found in request' }));
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json(jsend.error({ message: 'User not found' }));
        }

        return res.json(jsend.success({ data: user }));  // إرجاع بيانات المستخدم في الاستجابة

    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        return res.status(500).json(jsend.error({ message: 'Server error while fetching profile', error: error.message }));
    }
};

// تحديث الملف الشخصي
const updateUserProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(jsend.error({ errors: errors.array() }));
    }

    const { email, mobile, password, currentPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json(jsend.error({ message: 'User not found' }));
        }

        if (currentPassword && !(await user.isValidPassword(currentPassword))) {
            return res.status(400).json(jsend.error({ message: 'Incorrect current password' }));
        }

        user.email = email || user.email;
        user.mobile = mobile || user.mobile;
        user.password = password || user.password;

        await user.save();

        return res.status(200).json(jsend.success({ message: 'Profile updated successfully' }));
    } catch (err) {
        return res.status(500).json(jsend.error({ message: 'Error updating profile', error: err.message }));
    }
};

// تسجيل الخروج
const logoutUser = async (req, res) => {
    try {
        // تحقق من التوكن المستلم
        console.log('Received token:', req.token);

        // العثور على المستخدم باستخدام الـ ID
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json(jsend.error({ message: 'User not found' }));
        }

        // تحقق من التوكنات المخزنة في قاعدة البيانات
        console.log('User tokens:', user.tokens);

        // تحقق من تطابق التوكنات
        if (!user.tokens.includes(req.token)) {
            return res.status(401).json(jsend.error({ message: 'Token mismatch, unable to logout' }));
        }

        // إزالة التوكن من قائمة التوكنات
        user.tokens = user.tokens.filter(token => token !== req.token);
        await user.save();

        return res.status(200).json(jsend.success({ message: 'Logout successful' }));
    } catch (err) {
        return res.status(500).json(jsend.error({ message: 'Error logging out', error: err.message }));
    }
};

// تسجيل الخروج من جميع الأجهزة
const logoutAllUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json(jsend.error({ message: 'User not found' }));
        }

        user.tokens = [];
        await user.save();

        return res.status(200).json(jsend.success({ message: 'Logged out from all devices' }));
    } catch (err) {
        return res.status(500).json(jsend.error({ message: 'Error logging out from all devices', error: err.message }));
    }
};

// حذف الحساب
const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json(jsend.error({ message: 'User not found' }));
        }

        await user.deleteOne();

        return res.status(200).json(jsend.success({ message: 'Account deleted successfully' }));
    } catch (err) {
        return res.status(500).json(jsend.error({ message: 'Error deleting account', error: err.message }));
    }
};

// فك قفل الحساب
const unlockUserAccount = async (req, res) => {
    const { email } = req.body; // أخذ البريد الإلكتروني من الطلب

    try {
        const user = await User.findOne({ email }); // البحث عن المستخدم باستخدام البريد الإلكتروني
        if (!user) {
            return res.status(404).json(jsend.error({ message: 'User not found' })); // إذا لم يتم العثور على المستخدم
        }

        // التحقق من حالة القفل
        if (!user.accountLocked) {
            return res.status(400).json(jsend.error({ message: 'Account is not locked' })); // إذا لم يكن الحساب مغلقًا
        }

        // فك القفل
        user.accountLocked = false;
        user.failedLoginAttempts = 0; // إعادة تعيين عدد المحاولات الفاشلة
        user.lockUntil = null; // إعادة تعيين وقت القفل

        await user.save(); // حفظ التعديلات في قاعدة البيانات

        return res.status(200).json(jsend.success({ message: 'Account unlocked successfully' })); // إرسال استجابة ناجحة
    } catch (err) {
        return res.status(500).json(jsend.error({ message: 'Error unlocking account', error: err.message })); // إرسال استجابة في حال وجود خطأ
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
    unlockUserAccount
};
