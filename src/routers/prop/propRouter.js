const express = require('express');
const router = express.Router();

const PropController = require('../../controllers/prop/propController');
const checkAuthentication = require('../../middleware/user/checkAuthentication');
const checkAuthorization = require('../../middleware/user/checkAuthorization');
const { body } = require('express-validator');
const validationErrors = require('../../middleware/validationErrors');
const checkPaymentMethod = require('../../middleware/user/checkPaymentMethod');

// إنشاء إعلان
router.post(
    '/create',
    checkAuthentication,
    checkAuthorization(['admin', 'user']),
    [
        body('propType').notEmpty().withMessage('نوع العقار مطلوب'),
        body('transactionType').isIn(['rent', 'sale']).withMessage('نوع المعاملة غير صالح'),
        body('address.city').notEmpty().withMessage('المدينة مطلوبة'),
        body('address.area').notEmpty().withMessage('المنطقة مطلوبة'),
        body('address.street').notEmpty().withMessage('الشارع مطلوب'),
        body('address.building').isNumeric().withMessage('رقم المبنى يجب أن يكون رقمًا'),
        body('specification.rooms').isNumeric().withMessage('عدد الغرف مطلوب'),
        body('financial.price.amount').isFloat({ min: 10.0 }).withMessage('السعر غير كافٍ'),
        body('financial.price.currency').isIn(['USD']).withMessage('العملة غير صالحة'),
        body('images').isArray().withMessage('الصور يجب أن تكون مصفوفة')
    ],
    validationErrors.validationErrors,
    checkPaymentMethod,
    PropController.createProp
);

// استرجاع الإعلانات
router.get('/', PropController.getAllProps);
router.get('/featured', PropController.getFeaturedProps);
router.get('/pending', checkAuthentication, checkAuthorization(['user', 'admin']), PropController.getPendingProps);
router.get('/user', checkAuthentication, PropController.getUserProps);
router.get('/:id', PropController.getPropById);

// تحديث وحذف
router.put('/:id', checkAuthentication, PropController.updateProp);
router.delete('/:id', checkAuthentication, PropController.deleteProp);

// تفعيل وتعطيل
router.patch('/:id/activate', checkAuthentication, checkAuthorization(['admin', 'owner']), PropController.activateProp);
router.patch('/:id/deactivate', checkAuthentication, checkAuthorization(['admin', 'owner']), PropController.deactivateProp);
router.patch('/:id/reactivate', checkAuthentication, checkAuthorization(['admin', 'owner']), PropController.reActivateProp);
router.patch('/:id/feature', checkAuthentication, checkAuthorization(['admin', 'owner']), PropController.featureProp);

module.exports = router;
