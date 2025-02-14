const express = require('express')
const router = express.Router()
const User = require('../../models/user/userModel')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
// استخدام Middlewares لتحسين الأمان وتنظيم التطبيق
const auth = require('../../middleware/auth');

// مسار التسجيل
router.post('/register', [
    body('email')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLowercase().withMessage('Email should be in lowercase')
        .trim(),

    body('mobile')
        .isLength(8).withMessage('Mobile number must be 8 digits')
        .isNumeric().withMessage('Mobile number must contain only numbers'),

    body('password')
        .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[\]:;<>,.?/~_+\-=|\\]).{8,32}$/)
        .withMessage('Password must be between 8 and 32 characters long, and contain at least one number, one lowercase letter, one uppercase letter, and one special character (e.g., !, @, #, $, etc.)'),
], async (req, res) => {
    // التحقق من الأخطاء
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // إذا كانت البيانات صحيحة، يمكننا إنشاء المستخدم
    const { email, mobile, password } = req.body;
    try {
        // تحقق إذا كان المستخدم موجودًا بالفعل
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const user = new User({ email, mobile, password });
        await user.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
});

// مسار تسجيل الدخول
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await user.isValidPassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // توليد توكن JWT عند نجاح عملية تسجيل الدخول
        const token = jwt.sign(
            { userId: user._id, email: user.email }, // البيانات التي نريد تضمينها في التوكن
            process.env.JWT_SECRET,  // السر الذي سيتم استخدامه لتوقيع التوكن (يجب تخزينه في ملف .env)
            { expiresIn: '1h' } // صلاحية التوكن (مثال: 1 ساعة)
        );

        res.status(200).json({
            message: 'Login successful',
            token: token // إرجاع التوكن للمستخدم
        });

    } catch (err) {
        res.status(500).json({ message: 'Error logging in', error: err.message });
    }
});

// مسار محمي يتطلب التوكن
router.get('/profile', auth, (req, res) => {
    // إذا كان التوكن صالحًا، يمكننا الوصول إلى بيانات المستخدم التي تم فك تشفيرها بواسطة الميدلوير auth
    const token = req.headers.authorization?.split(' ')[1]; // استخراج التوكن من header

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // إذا كان التوكن صالحًا، يمكننا الوصول إلى بيانات المستخدم
        res.status(200).json({
            message: 'Profile data',
            user: decoded // استرجاع بيانات المستخدم من التوكن
        });
    });
});

// مسار تحديث بيانات المستخدم
router.patch('/update-profile', auth, [
    body('email')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLowercase().withMessage('Email should be in lowercase')
        .trim(),

    body('mobile')
        .isLength(8).withMessage('Mobile number must be 8 digits')
        .isNumeric().withMessage('Mobile number must contain only numbers'),

    body('password')
        .isLength({ min: 8, max: 16 }).withMessage('Password must between 8-16 characters long'),
], async (req, res) => {
    // التحقق من الأخطاء
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, mobile, password } = req.body;

    try {
        // البحث عن المستخدم الحالي باستخدام الـ ID من الـ JWT
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // تحديث البيانات
        user.email = email || user.email;
        user.mobile = mobile || user.mobile;
        user.password = password || user.password;

        await user.save();

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
});

// مسار حذف حساب المستخدم
router.delete('/delete-account', auth, async (req, res) => {
    try {
        // البحث عن المستخدم باستخدام الـ ID من الـ JWT
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // حذف الحساب
        await user.deleteOne();

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting account', error: err.message });
    }
});

module.exports = router;
