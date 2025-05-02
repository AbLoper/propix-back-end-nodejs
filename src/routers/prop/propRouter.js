const express = require('express');
const router = express.Router();
const PropController = require('../../controllers/prop/propController');
const checkAuthentication = require('../../middleware/user/checkAuthentication');
const checkAuthorization = require('../../middleware/user/checkAuthorization');
const { check } = require('express-validator');
const validationErrors = require('../../middleware/validationErrors');
const checkPaymentMethod = require('../../middleware/user/checkPaymentMethod');

// تعريف مسارات العقارات (Prop)

// 1. إنشاء عقار جديد
router.post(
    '/',
    checkAuthentication, // التحقق من هوية المستخدم
    checkAuthorization(['admin','user']), // التحقق من أن المستخدم هو المسؤول فقط
    [
        check('propType').notEmpty().withMessage('نوع العقار مطلوب'),
        check('transactionType').notEmpty().isIn(['rent', 'sale', 'investment']).withMessage('نوع المعاملة مطلوب'),
        check('address.city').notEmpty().withMessage('المدينة مطلوبة'),
        check('address.area').notEmpty().withMessage('المنطقة مطلوبة'),
        check('address.street').notEmpty().withMessage('الشارع مطلوب'),
        check('address.building').isNumeric().withMessage('رقم المبنى يجب أن يكون رقميًا'),
        check('address.floor').isNumeric().withMessage('الطابق يجب أن يكون رقميًا'),
        check('specification.rooms').isNumeric().withMessage('عدد الغرف يجب أن يكون رقميًا'),
        check('financial.price.amount').isFloat({ min: 10 }).withMessage('السعر يجب أن يكون أكبر من 10'),
        check('financial.price.currency').isIn(['USD']).withMessage('العملة غير صالحة'),
        check('images').isArray().withMessage('الصور يجب أن تكون مصفوفة'),
    ],
    validationErrors.validationErrors, // التحقق من الأخطاء في المدخلات
    checkPaymentMethod, // التحقق من طريقة الدفع
    PropController.createProp // استدعاء الدالة المسؤولة عن إنشاء العقار
);

// 2. الحصول على جميع العقارات
router.get('/', PropController.getAllProps);

// 3. الحصول على عقار حسب الـ id
router.get('/:id', PropController.getPropById);

// 4. تحديث بيانات عقار
router.put(
    '/:id',
    checkAuthentication, // التحقق من هوية المستخدم
    checkAuthorization(['admin']), // التحقق من أن المستخدم هو المسؤول فقط
    PropController.updateProp // استدعاء دالة التحديث
);

// 5. حذف عقار
router.delete(
    '/:id',
    checkAuthentication, // التحقق من هوية المستخدم
    checkAuthorization(['admin']), // التحقق من أن المستخدم هو المسؤول فقط
    PropController.deleteProp // استدعاء دالة الحذف
);

module.exports = router;
