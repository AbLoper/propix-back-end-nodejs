const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userAuth = require('../../middleware/user/userAuth');
const { registerLimiter, loginLimiter, updateProfileLimiter } = require('../../middleware/user/bruteForceProtection');
const userController = require('../../controllers/user/userController');
const checkRole = require('../../middleware/user/checkRole');
const { validationErrors } = require('../../middleware/validationErrors');  // استيراد الميدل وير الجديد

// مسار التسجيل
router.post('/register', registerLimiter, [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail().isLowercase().withMessage('Email should be in lowercase').trim(),
    body('mobile').isLength(8).withMessage('Mobile number must be 8 digits').isNumeric().withMessage('Mobile number must contain only numbers'),
    body('password').matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[*.!@$%^&(){}[\]:;<>,.?/~_+\-=|\\]).{8,32}$/).withMessage('Password must meet complexity criteria')
], validationErrors, userController.registerUser);

router.post('/register', (req, res) => {
    const { mobile, email, password, confirmPassword, acceptTerms } = req.body;
    
    // هنا يمكنك إضافة منطق التسجيل والتحقق من البيانات
    if (!mobile || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }
    
    // منطق التسجيل هنا
    res.status(200).json({ message: 'تم التسجيل بنجاح' });
  });
  


// مسار تسجيل الدخول
router.post('/login', loginLimiter, [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], validationErrors, userController.loginUser);

// مسار الحصول على صفحة المستخدم الشخصية
router.get('/profile', userAuth, userController.getUserProfile);

// مسار تحديث البيانات الشخصية
router.patch('/update-profile', userAuth, updateProfileLimiter, [
    body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail().isLowercase().withMessage('Email should be in lowercase').trim(),
    body('mobile').isLength(8).withMessage('Mobile number must be 8 digits').isNumeric().withMessage('Mobile number must contain only numbers'),
    body('password').isLength({ min: 8, max: 16 }).withMessage('Password must between 8-16 characters long')
], validationErrors, userController.updateUserProfile);

// مسار تسجيل الخروج
router.post('/logout', userAuth, userController.logoutUser);

// مسار تسجيل الخروج من جميع الأجهزة
router.post('/logoutAll', userAuth, userController.logoutAllUser);

// مسار حذف الحساب
router.delete('/delete-account', userAuth, userController.deleteAccount);

// مسار لإلغاء قفل الحساب - فقط للمسؤولين
router.post('/unlock', userAuth, checkRole(['admin', 'owner']), userController.unlockUserAccount);

module.exports = router;