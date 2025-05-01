const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const propController = require('../../controllers/prop/propController');
const checkAuthentication = require('../../middleware/user/checkAuthentication');
const checkAuthorization = require('../../middleware/user/checkAuthorization');
const { validationErrors } = require('../../middleware/validationErrors');

// 1. إضافة إعلان جديد
router.post(
    '/create',
    checkAuthentication,
    checkAuthorization(['user', 'admin', 'owner']),
    [
        body('propType').isString().withMessage('نوع العقار مطلوب').notEmpty(),
        body('transactionType').isString().withMessage('نوع المعاملة مطلوب').notEmpty(),
        body('address.city').isString().withMessage('المدينة مطلوبة').notEmpty(),
        body('address.area').isString().withMessage('المنطقة مطلوبة').notEmpty(),
        body('address.street').isString().withMessage('الشارع مطلوب').notEmpty(),
        body('address.building').isInt({ min: 1 }).withMessage('رقم المبنى يجب أن يكون أكبر من 0'),
        body('address.floor').isInt({ min: 1 }).withMessage('الطابق يجب أن يكون أكبر من 0'),
        body('financial.price.amount').isFloat({ gt: 0 }).withMessage('السعر يجب أن يكون قيمة عددية أكبر من 0'),
        body('financial.price.currency').isString().withMessage('العملة مطلوبة').notEmpty(),
        body('specification.rooms').isInt({ min: 1 }).withMessage('عدد الغرف مطلوب ويجب أن يكون أكبر من 0'),
        body('specification.floor').isInt({ min: 1 }).withMessage('الطابق مطلوب ويجب أن يكون أكبر من 0'),
        body('specification.bathroom').isInt({ min: 1 }).withMessage('عدد الحمامات مطلوب ويجب أن يكون أكبر من 0'),
    ],
    validationErrors,
    propController.createProp
);

// 2. تعديل إعلان
router.put(
    '/:id',
    checkAuthentication,
    checkAuthorization(['user', 'admin', 'owner']),
    [
        body('propType').optional().isString(),
        body('transactionType').optional().isString(),
        body('address.city').optional().isString(),
        body('address.area').optional().isString(),
        body('address.street').optional().isString(),
        body('address.building').optional().isInt({ min: 1 }),
        body('address.floor').optional().isInt({ min: 1 }),
        body('financial.price.amount').optional().isFloat({ gt: 0 }),
        body('financial.price.currency').optional().isString(),
        body('specification.rooms').optional().isInt({ min: 1 }),
        body('specification.floor').optional().isInt({ min: 1 }),
        body('specification.bathroom').optional().isInt({ min: 1 }),
    ],
    validationErrors,
    propController.updateProp
);

// باقي المسارات كما هي ولكن مع تحسينات طفيفة في المسارات:

router.delete('/:id', checkAuthentication, checkAuthorization(['user', 'admin', 'owner']), validationErrors, propController.deleteProp);
router.patch('/activate/:id', checkAuthentication, checkAuthorization(['admin', 'owner']), validationErrors, propController.activateProp);
router.patch('/deactivate/:id', checkAuthentication, checkAuthorization(['admin', 'owner']), validationErrors, propController.deactivateProp);
router.patch('/reactivate/:id', checkAuthentication, checkAuthorization(['admin', 'owner']), validationErrors, propController.reActivateProp);
router.get('/', checkAuthentication, checkAuthorization(['admin', 'owner']), validationErrors, propController.getAllProps);
router.get('/:id', checkAuthentication, checkAuthorization(['user', 'admin', 'owner']), validationErrors, propController.getPropById);
router.post('/search', checkAuthentication, checkAuthorization(['user', 'admin', 'owner']), validationErrors, propController.searchProps);

// تم تعديل هذا المسار لتوحيد البنية
router.put('/feature/:id', checkAuthentication, checkAuthorization(['admin', 'owner']), validationErrors, propController.featureProp);
router.get('/featured', checkAuthentication, checkAuthorization(['admin', 'owner']), validationErrors, propController.getFeaturedProps);
router.get('/userprops', checkAuthentication, checkAuthorization(['user', 'admin', 'owner']), validationErrors, propController.getUserProps);

module.exports = router;
