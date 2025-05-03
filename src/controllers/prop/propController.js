const Prop = require('../../models/prop/propModel');
const User = require('../../models/user/userModel');
const { default: mongoose } = require('mongoose');

// إضافة إعلان جديد
const createProp = async (req, res) => {
    try {
        const {
            propType,
            transactionType,
            address,
            specification,
            features,
            financial,
            images,
            note,
            notifications,
            isFeatured
        } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

        const { price, paymentMethod } = financial;
        const priceAmount = price?.amount || 0;

        let fee = 0;
        if (transactionType === 'rent') {
            fee = priceAmount * 0.05;
        } else if (transactionType === 'sale') {
            fee = priceAmount * 0.01;
        }

        const totalDeduction = priceAmount + fee;

        if (paymentMethod === 'funds') {
            if (user.funds < totalDeduction) {
                return res.status(400).json({ message: 'الرصيد غير كافٍ لإتمام العملية' });
            }
        } else if (paymentMethod === 'coupons') {
            if (!user.coupons || user.coupons < 1) {
                return res.status(400).json({ message: 'عدد الكوبونات غير كافٍ' });
            }
        } else {
            return res.status(400).json({ message: 'طريقة الدفع غير صالحة' });
        }

        const newProp = new Prop({
            propType,
            transactionType,
            address,
            specification,
            features,
            financial,
            images,
            note,
            notifications,
            isFeatured,
            createdBy: user._id,
            lastPublishedBy: user._id
        });

        await newProp.save();

        if (paymentMethod === 'funds') {
            user.funds -= totalDeduction;
        } else if (paymentMethod === 'coupons') {
            user.coupons -= 1;
        }
        await user.save();

        return res.status(201).json({ message: 'تم إنشاء الإعلان بنجاح', data: newProp });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الإعلان', error: error.message });
    }
};

// تعديل إعلان
const updateProp = async (req, res) => {
    try {
        const prop = await Prop.findById(req.params.id);
        if (!prop) return res.status(404).json({ message: 'الإعلان غير موجود' });

        const userId = req.user.userId || req.user.id || req.user._id;
        const userRoles = req.user.roles || [];

        if (prop.createdBy.toString() !== userId && !userRoles.includes('admin')) {
            return res.status(403).json({ message: 'لا تملك صلاحيات التعديل' });
        }

        const updatableFields = [
            'propType', 'transactionType', 'address', 'specification',
            'features', 'financial', 'images', 'note', 'expirydate', 'isFeatured'
        ];

        updatableFields.forEach(field => {
            if (req.body[field] !== undefined) {
                prop[field] = req.body[field];
            }
        });

        prop.status = 'waiting';
        await prop.save();
        return res.status(200).json({ message: 'تم تحديث الإعلان بنجاح', data: prop });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء التحديث', error: error.message });
    }
};


// حذف إعلان
const deleteProp = async (req, res) => {
    try {
        const prop = await Prop.findById(req.params.id);
        if (!prop) return res.status(404).json({ message: 'الإعلان غير موجود' });

        const userId = req.user?.userId || req.user?.id || req.user?._id;
        const userRoles = req.user?.roles || [];

        if (prop.createdBy.toString() !== userId && !userRoles.includes('admin')) {
            return res.status(403).json({ message: 'ليس لديك صلاحيات لحذف هذا الإعلان' });
        }

        await prop.deleteOne();
        return res.status(200).json({ message: 'تم حذف الإعلان بنجاح' });

    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء حذف الإعلان', error: error.message });
    }
};


// تفعيل إعلان
const activateProp = async (req, res) => {
    try {
        const prop = await Prop.findById(req.params.id);
        if (!prop) return res.status(404).json({ message: 'الإعلان غير موجود' });

        if (!['admin', 'owner'].includes(req.user.role)) {
            return res.status(403).json({ message: 'ليس لديك صلاحية لتفعيل هذا الإعلان' });
        }

        prop.status = 'approved';
        const updatedProp = await prop.save();
        return res.status(200).json({ message: 'تم تفعيل الإعلان بنجاح', data: updatedProp });

    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء التفعيل' });
    }
};

// تعطيل إعلان
const deactivateProp = async (req, res) => {
    try {
        const prop = await Prop.findById(req.params.id);
        if (!prop) return res.status(404).json({ message: 'الإعلان غير موجود' });

        if (!['admin', 'owner'].includes(req.user.role)) {
            return res.status(403).json({ message: 'ليس لديك صلاحية لتعطيل هذا الإعلان' });
        }

        prop.status = 'disabled';
        const updatedProp = await prop.save();
        return res.status(200).json({ message: 'تم تعطيل الإعلان بنجاح', data: updatedProp });

    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء التعطيل' });
    }
};

// إعادة تفعيل إعلان
const reActivateProp = async (req, res) => {
    try {
        const prop = await Prop.findById(req.params.id);
        if (!prop) return res.status(404).json({ message: 'الإعلان غير موجود' });

        if (!['admin', 'owner'].includes(req.user.role)) {
            return res.status(403).json({ message: 'ليس لديك صلاحية لإعادة التفعيل' });
        }

        prop.status = 'approved';
        const updatedProp = await prop.save();
        return res.status(200).json({ message: 'تم إعادة التفعيل بنجاح', data: updatedProp });

    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء إعادة التفعيل' });
    }
};

// الاستعلامات
const getAllProps = async (req, res) => {
    try {
        const props = await Prop.find().populate('createdBy', 'name email');
        if (!props.length) return res.status(404).json({ message: 'لا توجد إعلانات حالياً' });
        return res.status(200).json({ message: 'تم الاسترجاع بنجاح', data: props });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء الاسترجاع' });
    }
};

const getPropById = async (req, res) => {
    try {
        const prop = await Prop.findById(req.params.id).populate('createdBy', 'name email');
        if (!prop) return res.status(404).json({ message: 'الإعلان غير موجود' });
        return res.status(200).json({ message: 'تم الاسترجاع بنجاح', data: prop });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء الاسترجاع' });
    }
};

const featureProp = async (req, res) => {
    try {
        const prop = await Prop.findById(req.params.id);
        if (!prop) return res.status(404).json({ message: 'الإعلان غير موجود' });

        if (!['admin', 'owner'].includes(req.user.role)) {
            return res.status(403).json({ message: 'ليس لديك صلاحية لتعديل التمييز' });
        }

        prop.isFeatured = !prop.isFeatured;
        await prop.save();
        return res.status(200).json({
            message: `تم ${prop.isFeatured ? 'تفعيل' : 'تعطيل'} التمييز بنجاح`,
            data: prop
        });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء تعديل التمييز' });
    }
};

const getFeaturedProps = async (req, res) => {
    try {
        const props = await Prop.find({ isFeatured: true }).populate('createdBy', 'name email');
        if (!props.length) return res.status(404).json({ message: 'لا توجد إعلانات مميزة' });
        return res.status(200).json({ message: 'تم الاسترجاع بنجاح', data: props });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء الاسترجاع' });
    }
};

const getUserProps = async (req, res) => {
    try {
        const props = await Prop.find({ createdBy: req.user.userId || req.user._id });
        if (!props.length) return res.status(404).json({ message: 'لا توجد إعلانات خاصة بك' });
        return res.status(200).json({ message: 'تم الاسترجاع بنجاح', data: props });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء الاسترجاع', error: error.message });
    }
};

const getPendingProps = async (req, res) => {
    try {
        const props = await Prop.find({ status: 'waiting' }).populate('createdBy', 'name email');
        if (!props.length) return res.status(404).json({ message: 'لا توجد إعلانات معلقة' });
        return res.status(200).json({ message: 'تم الاسترجاع بنجاح', data: props });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء الاسترجاع' });
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
    featureProp,
    getFeaturedProps,
    getUserProps,
    getPendingProps
};
