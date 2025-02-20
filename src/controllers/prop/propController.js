const Prop = require('../../models/prop/propModel');
const User = require('../../models/user/userModel');
const mongoose = require('mongoose');

// 1. دالة إضافة إعلان جديد
createProp = async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            location,
            imageUrl,
            type,
            featured
        } = req.body;

        // تحقق من أن البيانات المطلوبة موجودة
        if (!title || !price || !location) {
            return res.status(400).json({ message: 'يرجى ملء جميع الحقول المطلوبة.' });
        }

        if (isNaN(price)) {
            return res.status(400).json({ message: 'يجب أن يكون السعر رقمًا صالحًا.' });
        }

        const newProp = new Prop({
            title,
            description: description || '', // إذا لم يتم تقديم وصف، نتركه فارغًا
            price,
            location,
            imageUrl: imageUrl || '', // إذا لم يتم تقديم رابط الصورة، نتركه فارغًا
            type: type || 'sale', // نوع الإعلان افتراضيًا 'بيع'
            featured: featured || false,
            owner: req.user._id, // مستخدم الذي أضاف الإعلان
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const savedProp = await newProp.save();
        return res.status(201).json({ message: 'تم إضافة الإعلان بنجاح', prop: savedProp });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء إضافة الإعلان', error: error.message });
    }
};


// 2. دالة تعديل إعلان
updateProp = async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            location,
            imageUrl,
            type,
            featured
        } = req.body;

        const propId = req.params.id;

        const prop = await Prop.findById(propId);

        if (!prop) {
            return res.status(404).json({ message: 'الإعلان غير موجود' });
        }

        // تحقق من أن المستخدم هو مالك الإعلان أو لديه صلاحية الإدارة
        if (prop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'ليس لديك صلاحية لتعديل هذا الإعلان' });
        }

        // تحديث الحقول التي تم تقديمها فقط
        if (title) prop.title = title;
        if (description) prop.description = description;
        if (price && !isNaN(price)) prop.price = price;
        if (location) prop.location = location;
        if (imageUrl) prop.imageUrl = imageUrl;
        if (type) prop.type = type;
        if (featured !== undefined) prop.featured = featured;

        // تحديث تاريخ التعديل
        prop.updatedAt = new Date();

        const updatedProp = await prop.save();
        return res.status(200).json({ message: 'تم تعديل الإعلان بنجاح', prop: updatedProp });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء تعديل الإعلان', error: error.message });
    }
};

// 3. دالة حذف إعلان
deleteProp = async (req, res) => {
    try {
        const propId = req.params.id;

        const prop = await Prop.findById(propId);

        if (!prop) {
            return res.status(404).json({ message: 'الإعلان غير موجود' });
        }

        // تحقق من أن المستخدم هو مالك الإعلان أو لديه صلاحية الإدارة
        if (prop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'ليس لديك صلاحية لحذف هذا الإعلان' });
        }

        await prop.remove();
        return res.status(200).json({ message: 'تم حذف الإعلان بنجاح' });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء حذف الإعلان', error: error.message });
    }
};

// 4. دالة تفعيل إعلان
activateProp = async (req, res) => {
    try {
        const propId = req.params.id;
        const prop = await Prop.findById(propId);

        if (!prop) {
            return res.status(404).json({ message: 'الإعلان غير موجود' });
        }

        // تحقق من الصلاحيات
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'ليس لديك صلاحية لتفعيل هذا الإعلان' });
        }

        prop.status = 'active';
        const updatedProp = await prop.save();
        return res.status(200).json({ message: 'تم تفعيل الإعلان بنجاح', prop: updatedProp });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء تفعيل الإعلان', error: error.message });
    }
};

// 5. دالة تعطيل إعلان
deactivateProp = async (req, res) => {
    try {
        const propId = req.params.id;
        const prop = await Prop.findById(propId);

        if (!prop) {
            return res.status(404).json({ message: 'الإعلان غير موجود' });
        }

        // تحقق من الصلاحيات
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'ليس لديك صلاحية لتعطيل هذا الإعلان' });
        }

        prop.status = 'inactive';
        const updatedProp = await prop.save();
        return res.status(200).json({ message: 'تم تعطيل الإعلان بنجاح', prop: updatedProp });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء تعطيل الإعلان', error: error.message });
    }
};

// 6. دالة إعادة تفعيل إعلان
reActivateProp = async (req, res) => {
    try {
        const propId = req.params.id;
        const prop = await Prop.findById(propId);

        if (!prop) {
            return res.status(404).json({ message: 'الإعلان غير موجود' });
        }

        // تحقق من الصلاحيات
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'ليس لديك صلاحية لإعادة تفعيل هذا الإعلان' });
        }

        prop.status = 'active';
        const updatedProp = await prop.save();
        return res.status(200).json({ message: 'تم إعادة تفعيل الإعلان بنجاح', prop: updatedProp });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء إعادة تفعيل الإعلان', error: error.message });
    }
};

// 7. دالة استرجاع جميع الإعلانات
getAllProps = async (req, res) => {
    try {
        const props = await Prop.find().populate('owner', 'name email');

        if (props.length === 0) {
            return res.status(404).json({ message: 'لا توجد إعلانات حالياً' });
        }

        return res.status(200).json({ message: 'تم استرجاع الإعلانات بنجاح', props });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء استرجاع الإعلانات', error: error.message });
    }
};

// 8. دالة استرجاع إعلان معين
getPropById = async (req, res) => {
    try {
        const propId = req.params.id;
        const prop = await Prop.findById(propId).populate('owner', 'name email');

        if (!prop) {
            return res.status(404).json({ message: 'الإعلان غير موجود' });
        }

        return res.status(200).json({ message: 'تم استرجاع الإعلان بنجاح', prop });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء استرجاع الإعلان', error: error.message });
    }
};

// 9. دالة البحث باستخدام الفلاتر
searchProps = async (req, res) => {
    try {
        const { location, price, type, featured } = req.body;

        const filters = {};
        if (location) filters.location = location;
        if (price) filters.price = { $lte: price }; // أقل من أو يساوي السعر المحدد
        if (type) filters.type = type;
        if (featured !== undefined) filters.featured = featured;

        const props = await Prop.find(filters);

        if (props.length === 0) {
            return res.status(404).json({ message: 'لا توجد إعلانات تطابق الفلاتر المحددة' });
        }

        return res.status(200).json({ message: 'تم استرجاع الإعلانات بنجاح', props });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء البحث', error: error.message });
    }
};

// 10. دالة تفعيل أو تعطيل الإعلان كمميز
featureProp = async (req, res) => {
    try {
        const propId = req.params.id;
        const prop = await Prop.findById(propId);

        if (!prop) {
            return res.status(404).json({ message: 'الإعلان غير موجود' });
        }

        // تحقق من الصلاحيات
        if (req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ message: 'ليس لديك صلاحية لتفعيل أو تعطيل الإعلان كمميز' });
        }

        prop.featured = !prop.featured;
        const updatedProp = await prop.save();
        return res.status(200).json({ message: `تم ${prop.featured ? 'تفعيل' : 'تعطيل'} الإعلان كمميز بنجاح`, prop: updatedProp });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء تفعيل أو تعطيل الإعلان كمميز', error: error.message });
    }
};

// 11. دالة استرجاع الإعلانات المميزة
getFeaturedProps = async (req, res) => {
    try {
        const props = await Prop.find({ featured: true }).populate('owner', 'name email');

        if (props.length === 0) {
            return res.status(404).json({ message: 'لا توجد إعلانات مميزة حالياً' });
        }

        return res.status(200).json({ message: 'تم استرجاع الإعلانات المميزة بنجاح', props });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء استرجاع الإعلانات المميزة', error: error.message });
    }
};

// 12. دالة استرجاع الإعلانات الخاصة بالمستخدم
getUserProps = async (req, res) => {
    try {
        const props = await Prop.find({ owner: req.user._id });

        if (props.length === 0) {
            return res.status(404).json({ message: 'ليس لديك أي إعلانات' });
        }

        return res.status(200).json({ message: 'تم استرجاع الإعلانات الخاصة بك بنجاح', props });
    } catch (error) {
        return res.status(500).json({ message: 'حدث خطأ أثناء استرجاع الإعلانات الخاصة بك', error: error.message });
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