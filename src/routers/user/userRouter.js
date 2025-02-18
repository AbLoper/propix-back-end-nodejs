const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userAuth = require('../../middleware/user/userAuth');
const { registerLimiter, loginLimiter } = require('../../middleware/user/bruteForceProtection');
const userController = require('../../controllers/user/userController');
const checkRole = require('../../middleware/user/checkRole');

// مسار التسجيل
router.post('/register', registerLimiter, [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail().isLowercase().withMessage('Email should be in lowercase').trim(),
    body('mobile').isLength(8).withMessage('Mobile number must be 8 digits').isNumeric().withMessage('Mobile number must contain only numbers'),
    body('password').matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[\]:;<>,.?/~_+\-=|\\]).{8,32}$/).withMessage('Password must meet complexity criteria')
], userController.registerUser);

// مسار تسجيل الدخول
router.post('/login', loginLimiter, [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], userController.loginUser);

// مسار تحديث البيانات الشخصية
router.patch('/update-profile', userAuth, [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail().isLowercase().withMessage('Email should be in lowercase').trim(),
    body('mobile').isLength(8).withMessage('Mobile number must be 8 digits').isNumeric().withMessage('Mobile number must contain only numbers'),
    body('password').isLength({ min: 8, max: 16 }).withMessage('Password must between 8-16 characters long')
], userController.updateProfile);

// مسار تسجيل الخروج
router.post('/logout', userAuth, userController.logoutUser);

// مسار تسجيل الخروج من جميع الأجهزة
router.post('/logoutAll', userAuth, userController.logoutAllUser);

// مسار حذف الحساب
router.delete('/delete-account', userAuth, userController.deleteAccount);

// مسار لإلغاء قفل الحساب - فقط للمسؤولين
router.post('/unlock', checkRole(['admin', 'owner']), userController.unlockUserAccount);

module.exports = router;
