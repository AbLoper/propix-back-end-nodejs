const express = require('express');
const router = express.Router();
const propController = require('../../controllers/prop/propController');
const checkRole = require('../../middleware/user/checkRole');
const verifyToken = require('../../middleware/user/userAuth');
const { validationErrors } = require('../../middleware/validationErrors');  // استيراد الميدل وير الجديد

// 1. إضافة إعلان جديد
router.post(
    '/create',
    verifyToken,  // تأكد من أن المستخدم مسجل دخول
    checkRole(['user', 'admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.createProp  // استدعاء دالة إضافة الإعلان
);

// 2. تعديل إعلان
router.put(
    '/:id',
    verifyToken,  // تأكد من أن المستخدم مسجل دخول
    checkRole(['user', 'admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.updateProp  // استدعاء دالة تعديل الإعلان
);

// 3. حذف إعلان
router.delete(
    '/:id',
    verifyToken,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['user', 'admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.deleteProp  // استدعاء دالة حذف الإعلان
);

// 4. تفعيل إعلان
router.patch(
    '/activate/:id',
    verifyToken,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.activateProp  // استدعاء دالة تفعيل الإعلان
);

// 5. تعطيل إعلان
router.patch(
    '/deactivate/:id',
    verifyToken,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.deactivateProp  // استدعاء دالة تعطيل الإعلان
);

// 6. إعادة تفعيل الإعلان بعد انتهاء الصلاحية
router.patch(
    '/reactivate/:id',
    verifyToken,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.reActivateProp  // استدعاء دالة إعادة تفعيل الإعلان
);

// 7. استعراض جميع الإعلانات
router.get(
    '/',
    verifyToken,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['user', 'admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.getAllProps  // استدعاء دالة استعراض الإعلانات
);

// 8. استعراض إعلان معين
router.get(
    '/:id',
    verifyToken,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['user', 'admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.getPropById  // استدعاء دالة استعراض الإعلان
);

// 9. مسار البحث باستخدام الفلاتر
router.post(
    '/search',
    verifyToken,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['user', 'admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.searchProps  // استدعاء دالة البحث
);

// 10. تفعيل أو تعطيل الإعلان كمميز
router.put(
    '/prop/feature/:id',
    verifyToken,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.featureProp  // استدعاء دالة تفعيل أو تعطيل الإعلان كمميز
);

// 11. استرجاع جميع الإعلانات المميزة
router.get(
    '/prop/featured',
    verifyToken,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.getFeaturedProps  // استدعاء دالة استرجاع الإعلانات المميزة
);

// 12. استعراض الإعلانات الخاصة بالمستخدم نفسه
router.get(
    '/userprops',
    verifyToken,  // التأكد من أن المستخدم مسجل دخول
    checkRole(['user', 'admin', 'owner']),  // التأكد من الصلاحيات
    validationErrors, // ميدلوير التحقق من الأخطاء
    propController.getUserProps  // استدعاء دالة استرجاع الإعلانات الخاصة بالمستخدم
);

module.exports = router;
