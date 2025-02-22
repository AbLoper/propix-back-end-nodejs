const Prop = require('../../models/prop/propModel');
const User = require('../../models/user/userModel');
const jsend = require('jsend');

// 1. دالة إضافة إعلان جديد
const createProp = async (req, res) => {
    const { price, type, description, expirydate } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json(jsend.error({ message: 'المستخدم غير موجود' }));
        }

        if (user.balance < price.amount) {
            return res.status(400).json(jsend.error({ message: 'رصيد المستخدم غير كافٍ' }));
        }

        const newProp = new Prop({
            createdBy: user.id,
            price,
            type,
            description,
            expirydate,
            status: 'active',
        });

        await newProp.save();

        // خصم الرصيد
        user.balance -= price.amount;
        await user.save();

        return res.status(201).json(jsend.success({ message: 'تم إضافة الإعلان بنجاح', data: newProp }));
    } catch (error) {
        return res.status(500).json(jsend.error({ message: 'حدث خطأ أثناء إضافة الإعلان' }));
    }
};

// 2. دالة تعديل إعلان
const updateProp = async (req, res) => {
    const { price, type, description, expirydate } = req.body;

    try {
        const prop = await Prop.findById(req.params.id);
        if (!prop) {
            return res.status(404).json(jsend.error({ message: 'الإعلان غير موجود' }));
        }

        // التحقق من الأدوار
        if (prop.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
            return res.status(403).json(jsend.error({ message: 'ليس لديك صلاحيات لتعديل هذا الإعلان' }));
        }

        prop.price = price;
        prop.type = type;
        prop.description = description;
        prop.expirydate = expirydate;

        await prop.save();

        return res.status(200).json(jsend.success({ message: 'تم تعديل الإعلان بنجاح', data: prop }));
    } catch (error) {
        return res.status(500).json(jsend.error({ message: 'حدث خطأ أثناء تعديل الإعلان' }));
    }
};

// 3. دالة حذف إعلان
const deleteProp = async (req, res) => {
    try {
        const prop = await Prop.findById(req.params.id);
        if (!prop) {
            return res.status(404).json(jsend.error({ message: 'الإعلان غير موجود' }));
        }

        // التحقق من الأدوار
        if (prop.createdBy.toString() !== req.user.id && !req.user.roles.includes('admin')) {
            return res.status(403).json(jsend.error({ message: 'ليس لديك صلاحيات لحذف هذا الإعلان' }));
        }

        await prop.remove();
        return res.status(200).json(jsend.success({ message: 'تم حذف الإعلان بنجاح' }));
    } catch (error) {
        return res.status(500).json(jsend.error({ message: 'حدث خطأ أثناء حذف الإعلان' }));
    }
};

// 4. دالة تفعيل إعلان
activateProp = async (req, res, next) => {
    try {
        const propId = req.params.id;
        const prop = await Prop.findById(propId);

        if (!prop) {
            return res.status(404).json(jsend.fail({ message: 'الإعلان غير موجود' }));
        }

        // تحقق من الصلاحيات
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json(jsend.fail({ message: 'ليس لديك صلاحية لتفعيل هذا الإعلان' }));
        }

        prop.status = 'active';
        const updatedProp = await prop.save();
        return res.status(200).json(jsend.success({ message: 'تم تفعيل الإعلان بنجاح', prop: updatedProp }));
    } catch (error) {
        next(error);  // استخدم next لتحويل الخطأ إلى معالج الأخطاء في middleware
    }
};

// 5. دالة تعطيل إعلان
deactivateProp = async (req, res, next) => {
    try {
        const propId = req.params.id;
        const prop = await Prop.findById(propId);

        if (!prop) {
            return res.status(404).json(jsend.fail({ message: 'الإعلان غير موجود' }));
        }

        // تحقق من الصلاحيات
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json(jsend.fail({ message: 'ليس لديك صلاحية لتعطيل هذا الإعلان' }));
        }

        prop.status = 'inactive';
        const updatedProp = await prop.save();
        return res.status(200).json(jsend.success({ message: 'تم تعطيل الإعلان بنجاح', prop: updatedProp }));
    } catch (error) {
        next(error);
    }
};

// 6. دالة إعادة تفعيل إعلان
reActivateProp = async (req, res, next) => {
    try {
        const propId = req.params.id;
        const prop = await Prop.findById(propId);

        if (!prop) {
            return res.status(404).json(jsend.fail({ message: 'الإعلان غير موجود' }));
        }

        // تحقق من الصلاحيات
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json(jsend.fail({ message: 'ليس لديك صلاحية لإعادة تفعيل هذا الإعلان' }));
        }

        prop.status = 'active';
        const updatedProp = await prop.save();
        return res.status(200).json(jsend.success({ message: 'تم إعادة تفعيل الإعلان بنجاح', prop: updatedProp }));
    } catch (error) {
        next(error);
    }
};

// 7. دالة استرجاع جميع الإعلانات
getAllProps = async (req, res, next) => {
    try {
        const props = await Prop.find().populate('owner', 'name email');

        if (props.length === 0) {
            return res.status(404).json(jsend.fail({ message: 'لا توجد إعلانات حالياً' }));
        }

        return res.status(200).json(jsend.success({ message: 'تم استرجاع الإعلانات بنجاح', props }));
    } catch (error) {
        next(error);
    }
};

// 8. دالة استرجاع إعلان معين
getPropById = async (req, res, next) => {
    try {
        const propId = req.params.id;
        const prop = await Prop.findById(propId).populate('owner', 'name email');

        if (!prop) {
            return res.status(404).json(jsend.fail({ message: 'الإعلان غير موجود' }));
        }

        return res.status(200).json(jsend.success({ message: 'تم استرجاع الإعلان بنجاح', prop }));
    } catch (error) {
        next(error);
    }
};

// 9. دالة البحث باستخدام الفلاتر
searchProps = async (req, res, next) => {
    try {
        const { location, price, type, featured } = req.body;

        const filters = {};
        if (location) filters.location = location;
        if (price) filters.price = { $lte: price }; // أقل من أو يساوي السعر المحدد
        if (type) filters.type = type;
        if (featured !== undefined) filters.featured = featured;

        const props = await Prop.find(filters);

        if (props.length === 0) {
            return res.status(404).json(jsend.fail({ message: 'لا توجد إعلانات تطابق الفلاتر المحددة' }));
        }

        return res.status(200).json(jsend.success({ message: 'تم استرجاع الإعلانات بنجاح', props }));
    } catch (error) {
        next(error);
    }
};

// 10. دالة تفعيل أو تعطيل الإعلان كمميز
featureProp = async (req, res, next) => {
    try {
        const propId = req.params.id;
        const prop = await Prop.findById(propId);

        if (!prop) {
            return res.status(404).json(jsend.fail({ message: 'الإعلان غير موجود' }));
        }

        // تحقق من الصلاحيات
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json(jsend.fail({ message: 'ليس لديك صلاحية لتفعيل أو تعطيل الإعلان كمميز' }));
        }

        prop.featured = !prop.featured;
        const updatedProp = await prop.save();
        return res.status(200).json(jsend.success({ message: `تم ${prop.featured ? 'تفعيل' : 'تعطيل'} الإعلان كمميز بنجاح`, prop: updatedProp }));
    } catch (error) {
        next(error);
    }
};

// 11. دالة استرجاع الإعلانات المميزة
getFeaturedProps = async (req, res, next) => {
    try {
        const props = await Prop.find({ featured: true }).populate('owner', 'name email');

        if (props.length === 0) {
            return res.status(404).json(jsend.fail({ message: 'لا توجد إعلانات مميزة حالياً' }));
        }

        return res.status(200).json(jsend.success({ message: 'تم استرجاع الإعلانات المميزة بنجاح', props }));
    } catch (error) {
        next(error);
    }
};

// 12. دالة استرجاع الإعلانات الخاصة بالمستخدم
getUserProps = async (req, res, next) => {
    try {
        const props = await Prop.find({ owner: req.user._id });

        if (props.length === 0) {
            return res.status(404).json(jsend.fail({ message: 'ليس لديك أي إعلانات' }));
        }

        return res.status(200).json(jsend.success({ message: 'تم استرجاع الإعلانات الخاصة بك بنجاح', props }));
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
    getUserProps
}