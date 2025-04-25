const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const propController = require('../../controllers/prop/propController');
const checkRole = require('../../middleware/user/checkRole');
const userAuth = require('../../middleware/user/userAuth');
const { validationErrors } = require('../../middleware/validationErrors');  // استيراد الميدل وير الجديد

// 1. إضافة إعلان جديد
router.post(
    '/create',
    userAuth,  // تأكد من أن المستخدم مسجل دخول
    checkRole(['user', 'admin', 'owner']),  // التأكد من الصلاحيات
    // التحقق من صحة البيانات باستخدام express-validator
    [
        body('propType').isString().withMessage('نوع العقار مطلوب').notEmpty(),
        body('address.city').isString().withMessage('المدينة مطلوبة').notEmpty(),
        body('address.area').isString().withMessage('المنطقة مطلوبة').notEmpty(),
        body('address.street').isString().withMessage('الشارع مطلوب').notEmpty(),
        body('address.building').isInt({ min: 1 }).withMessage('رقم المبنى مطلوب ويجب أن يكون أكبر من 0'),
        body('address.floor').isInt({ min: 1 }).withMessage('الطابق مطلوب ويجب أن يكون أكبر من 0'),
        body('price.amount').isFloat({ gt: 0 }).withMessage('السعر يجب أن يكون قيمة عددية أكبر من 0'),
        body('price.currency').isString().withMessage('العملة مطلوبة').notEmpty(),
        body('specification.rooms').isInt({ min: 1 }).withMessage('عدد الغرف مطلوب ويجب أن يكون أكبر من 0'),
        body('specification.floor').isInt({ min: 1 }).withMessage('الطابق مطلوب ويجب أن يكون أكبر من 0'),
        body('specification.bathroom').isInt({ min: 1 }).withMessage('عدد الحمامات مطلوب ويجب أن يكون أكبر من 0'),
    ],
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.createProp  // استدعاء دالة إضافة الإعلان
);

// 2. تعديل إعلان
router.put(
    '/:id',
    userAuth,  // تأكد من أن المستخدم مسجل دخول
    checkRole(['user', 'admin', 'owner']),  // التأكد من الصلاحيات
    [
        body('propType').optional().isString().withMessage('نوع العقار يجب أن يكون نصًا'),
        body('address.city').optional().isString().withMessage('المدينة يجب أن تكون نصًا'),
        body('address.area').optional().isString().withMessage('المنطقة يجب أن تكون نصًا'),
        body('address.street').optional().isString().withMessage('الشارع يجب أن يكون نصًا'),
        body('address.building').optional().isInt({ min: 1 }).withMessage('رقم المبنى يجب أن يكون أكبر من 0'),
        body('address.floor').optional().isInt({ min: 1 }).withMessage('الطابق يجب أن يكون أكبر من 0'),
        body('price.amount').optional().isFloat({ gt: 0 }).withMessage('السعر يجب أن يكون أكبر من 0'),
        body('price.currency').optional().isString().withMessage('العملة يجب أن تكون نصًا'),
        body('specification.rooms').optional().isInt({ min: 1 }).withMessage('عدد الغرف يجب أن يكون أكبر من 0'),
        body('specification.floor').optional().isInt({ min: 1 }).withMessage('الطابق يجب أن يكون أكبر من 0'),
        body('specification.bathroom').optional().isInt({ min: 1 }).withMessage('عدد الحمامات يجب أن يكون أكبر من 0'),
    ],
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.updateProp  // استدعاء دالة تعديل الإعلان
);

// 3. حذف إعلان
router.delete(
    '/:id',
    userAuth,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['user', 'admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.deleteProp  // استدعاء دالة حذف الإعلان
);

// 4. تفعيل إعلان
router.patch(
    '/activate/:id',
    userAuth,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.activateProp  // استدعاء دالة تفعيل الإعلان
);

// 5. تعطيل إعلان
router.patch(
    '/deactivate/:id',
    userAuth,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.deactivateProp  // استدعاء دالة تعطيل الإعلان
);

// 6. إعادة تفعيل الإعلان بعد انتهاء الصلاحية
router.patch(
    '/reactivate/:id',
    userAuth,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.reActivateProp  // استدعاء دالة إعادة تفعيل الإعلان
);

// 7. استعراض جميع الإعلانات
router.get(
    '/',
    userAuth,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.getAllProps  // استدعاء دالة استعراض الإعلانات
);

// 8. استعراض إعلان معين
router.get(
    '/:id',
    userAuth,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['user', 'admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.getPropById  // استدعاء دالة استعراض الإعلان
);

// 9. مسار البحث باستخدام الفلاتر
router.post(
    '/search',
    userAuth,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['user', 'admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.searchProps  // استدعاء دالة البحث
);

// 10. تفعيل أو تعطيل الإعلان كمميز
router.put(
    '/prop/feature/:id',
    userAuth,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.featureProp  // استدعاء دالة تفعيل أو تعطيل الإعلان كمميز
);

// 11. استرجاع جميع الإعلانات المميزة
router.get(
    '/prop/featured',
    userAuth,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.getFeaturedProps  // استدعاء دالة استرجاع الإعلانات المميزة
);

// 12. استعراض الإعلانات الخاصة بالمستخدم نفسه
router.get(
    '/userprops',
    userAuth,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['user', 'admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.getUserProps  // استدعاء دالة استرجاع الإعلانات الخاصة بالمستخدم
);

module.exports = router;