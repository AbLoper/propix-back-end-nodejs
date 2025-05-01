const Prop = require('../../models/prop/propModel');
const User = require('../../models/user/userModel');
const { default: mongoose } = require("mongoose");

// إضافة إعلان جديد
const createProp = async (req, res) => {
    const {
        propType, transactionType, address, specification, features,
        financial, images, notifications, note, isFeatured
    } = req.body;

    if (!propType || !transactionType || !address || !specification || !features || !financial || !images) {
        return res.fail('البيانات غير مكتملة أو بعض الحقول مفقودة');
    }

    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.error('المستخدم غير موجود', 404);

        const priceAmount = financial?.price?.amount || 0;
        if (user.balance < priceAmount) return res.fail('رصيد المستخدم غير كافٍ لإضافة الإعلان');

        const newProp = new Prop({
            propType,
            transactionType,
            address,
            specification,
            features,
            financial,
            images,
            notifications: notifications || [],
            note: note || '',
            isFeatured: isFeatured || false,
            createdBy: user._id,
            disabledBy: user._id,
            lastPublishedBy: user._id,
            status: 'waiting'
        });

        await newProp.save();
        user.balance -= priceAmount;
        await user.save();

        return res.success({ message: 'تم إضافة الإعلان بنجاح', data: newProp });

    } catch (error) {
        console.error('Error in createProp:', error);
        return res.error('حدث خطأ أثناء إنشاء الإعلان', 500);
    }
};

// تعديل إعلان
const updateProp = async (req, res) => {
    const { propType, transactionType, address, specification, features, financial, expirydate, isFeatured, images, note } = req.body;

    try {
        const prop = await Prop.findById(req.params.id);
        if (!prop) return res.fail('الإعلان غير موجود');

        if (prop.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
            return res.fail('ليس لديك صلاحيات لتعديل هذا الإعلان', 403);
        }

        prop.propType = propType;
        prop.transactionType = transactionType;
        prop.address = address;
        prop.specification = specification;
        prop.features = features;
        prop.financial = financial;
        prop.images = images || prop.images;
        prop.note = note || prop.note;
        prop.expirydate = expirydate;
        prop.status = 'waiting';
        prop.isFeatured = isFeatured !== undefined ? isFeatured : prop.isFeatured;

        await prop.save();
        return res.success({ message: 'تم تعديل الإعلان بنجاح', data: prop });

    } catch (error) {
        return res.error('حدث خطأ أثناء تعديل الإعلان', 500);
    }
};

// حذف إعلان
const deleteProp = async (req, res) => {
    try {
        const prop = await Prop.findById(req.params.id);
        if (!prop) return res.fail('الإعلان غير موجود');

        if (prop.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
            return res.fail('ليس لديك صلاحيات لحذف هذا الإعلان', 403);
        }

        await prop.remove();
        return res.success({ message: 'تم حذف الإعلان بنجاح' });

    } catch (error) {
        return res.error('حدث خطأ أثناء حذف الإعلان');
    }
};

// تفعيل إعلان
const activateProp = async (req, res, next) => {
    try {
        const prop = await Prop.findById(req.params.id);
        if (!prop) return res.fail('الإعلان غير موجود', 404);

        if (!['admin', 'owner'].includes(req.user.role)) {
            return res.fail('ليس لديك صلاحية لتفعيل هذا الإعلان', 403);
        }

        prop.status = 'active';
        const updatedProp = await prop.save();
        return res.success({ message: 'تم تفعيل الإعلان بنجاح', prop: updatedProp });

    } catch (error) {
        next(error);
    }
};

// تعطيل إعلان
const deactivateProp = async (req, res, next) => {
    try {
        const prop = await Prop.findById(req.params.id);
        if (!prop) return res.fail('الإعلان غير موجود');

        if (!['admin', 'owner'].includes(req.user.role)) {
            return res.fail('ليس لديك صلاحية لتعطيل هذا الإعلان', 403);
        }

        prop.status = 'inactive';
        const updatedProp = await prop.save();
        return res.success({ message: 'تم تعطيل الإعلان بنجاح', prop: updatedProp });

    } catch (error) {
        next(error);
    }
};

// إعادة تفعيل إعلان
const reActivateProp = async (req, res, next) => {
    try {
        const prop = await Prop.findById(req.params.id);
        if (!prop) return res.fail('الإعلان غير موجود');

        if (!['admin', 'owner'].includes(req.user.role)) {
            return res.fail('ليس لديك صلاحية لإعادة تفعيل هذا الإعلان', 403);
        }

        prop.status = 'active';
        const updatedProp = await prop.save();
        return res.success({ message: 'تم إعادة تفعيل الإعلان بنجاح', prop: updatedProp });

    } catch (error) {
        next(error);
    }
};

// استرجاع جميع الإعلانات
const getAllProps = async (req, res, next) => {
    try {
        const props = await Prop.find().populate('createdBy', 'name email');
        if (!props.length) return res.fail('لا توجد إعلانات حالياً');
        return res.success({ message: 'تم استرجاع الإعلانات بنجاح', props });

    } catch (error) {
        next(error);
    }
};

// استرجاع إعلان معين
const getPropById = async (req, res, next) => {
    try {
        const prop = await Prop.findById(req.params.id).populate('createdBy', 'name email');
        if (!prop) return res.fail('الإعلان غير موجود');
        return res.success({ message: 'تم استرجاع الإعلان بنجاح', prop });

    } catch (error) {
        next(error);
    }
};

// البحث باستخدام الفلاتر
const searchProps = async (req, res, next) => {
    try {
        const { location, price, type, featured } = req.body;
        const filters = {};
        if (location) filters.location = location;
        if (price) filters.price = { $lte: price };
        if (type) filters.type = type;
        if (featured !== undefined) filters.featured = featured;

        const props = await Prop.find(filters);
        if (!props.length) return res.fail('لا توجد إعلانات تطابق الفلاتر المحددة');

        return res.success({ message: 'تم استرجاع الإعلانات بنجاح', props });

    } catch (error) {
        next(error);
    }
};

// تفعيل/تعطيل الإعلان كمميز
const featureProp = async (req, res, next) => {
    try {
        const prop = await Prop.findById(req.params.id);
        if (!prop) return res.fail('الإعلان غير موجود');

        if (!['admin', 'owner'].includes(req.user.role)) {
            return res.fail('ليس لديك صلاحية لتفعيل أو تعطيل الإعلان كمميز', 403);
        }

        prop.isFeatured = !prop.isFeatured;
        const updatedProp = await prop.save();
        return res.success({
            message: `تم ${prop.isFeatured ? 'تفعيل' : 'تعطيل'} الإعلان كمميز بنجاح`,
            prop: updatedProp
        });

    } catch (error) {
        next(error);
    }
};

// الإعلانات المميزة
const getFeaturedProps = async (req, res, next) => {
    try {
        const props = await Prop.find({ featured: true }).populate('owner', 'name email');
        if (!props.length) return res.fail('لا توجد إعلانات مميزة حالياً');
        return res.success({ message: 'تم استرجاع الإعلانات المميزة بنجاح', props });

    } catch (error) {
        next(error);
    }
};

// إعلانات المستخدم
const getUserProps = async (req, res, next) => {
    try {
        const props = await Prop.find({ owner: req.user._id });
        if (!props.length) return res.fail('ليس لديك أي إعلانات');
        return res.success({ message: 'تم استرجاع الإعلانات الخاصة بك بنجاح', props });

    } catch (error) {
        next(error);
    }
};

// الإعلانات المعلقة
const getPendingProps = async (req, res, next) => {
    try {
        const pendingProps = await Prop.find({ status: 'waiting' }).populate('createdBy', 'name email');
        if (!pendingProps.length) return res.fail('لا توجد إعلانات معلقة حالياً');
        return res.success({ message: 'تم استرجاع الإعلانات المعلقة بنجاح', props: pendingProps });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createProp,
    updateProp,
    deleteProp,
    activateProp,
    deactivateProp,
    reActivateProp,
    getAllProps,
    getPropById,
    searchProps,
    featureProp,
    getFeaturedProps,
    getUserProps,
    getPendingProps
}