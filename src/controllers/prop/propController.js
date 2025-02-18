const Prop = require('../../models/prop/propModel'); // استيراد النموذج
const User = require('../../models/user/userModel'); // استيراد النموذج المستخدم (لربطه بالإعلانات)
const { ObjectId } = require('mongoose').Types;

// 1. إضافة إعلان جديد
const createProp = async (req, res) => {
    try {
        const { userId } = req.user;
        const {
            propType, address, price, specification, features, images, financial, expirydate,
            phoneNumber, favorites, adNumber
        } = req.body;

        if (!propType || !address || !price || !specification) {
            return res.status(400).json({ error: 'يرجى إدخال جميع الحقول الأساسية' });
        }

        const newProp = new Prop({
            propType, address, price, specification, features, images, financial, expirydate,
            phoneNumber, favorites, adNumber, createdBy: userId, status: 'waiting',
        });

        await newProp.save();
        res.status(201).json({
            message: 'تم إضافة الإعلان بنجاح',
            prop: newProp,
        });
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء إضافة الإعلان', details: err });
    }
};

// 2. تعديل إعلان
const updateProp = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;
        const {
            propType, address, price, specification, features, images, financial, status,
            expirydate, phoneNumber, favorites, adNumber
        } = req.body;

        const prop = await Prop.findById(id);
        if (!prop) {
            return res.status(404).json({ error: 'الإعلان غير موجود' });
        }

        if (!checkPermissions(userId, prop.createdBy, req.user.role)) {
            return res.status(403).json({ error: 'ليس لديك الصلاحية لتعديل هذا الإعلان' });
        }

        prop.propType = propType || prop.propType;
        prop.address = address || prop.address;
        prop.price = price || prop.price;
        prop.specification = specification || prop.specification;
        prop.features = features || prop.features;
        prop.images = images || prop.images;
        prop.financial = financial || prop.financial;
        prop.status = status || prop.status;
        prop.expirydate = expirydate || prop.expirydate;
        prop.phoneNumber = phoneNumber || prop.phoneNumber;
        prop.favorites = favorites || prop.favorites;
        prop.adNumber = adNumber || prop.adNumber;
        prop.modifiedBy = userId;
        prop.modifiedAt = new Date();

        await prop.save();
        res.status(200).json({
            message: 'تم تعديل الإعلان بنجاح',
            prop,
        });
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء تعديل الإعلان', details: err });
    }
};

// 3. حذف إعلان
const deleteProp = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const prop = await Prop.findById(id);
        if (!prop) {
            return res.status(404).json({ error: 'الإعلان غير موجود' });
        }

        // تحقق من أن المستخدم هو صاحب الإعلان أو يمتلك صلاحيات "مدير" أو "مشرف"
        if (String(prop.createdBy) !== String(userId) && req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ error: 'ليس لديك الصلاحية لحذف هذا الإعلان' });
        }

        // حذف الإعلان
        await prop.remove();

        res.status(200).json({
            message: 'تم حذف الإعلان بنجاح',
        });
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء حذف الإعلان', details: err });
    }
};

// 4. تفعيل إعلان
const activateProp = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const prop = await Prop.findById(id);
        if (!prop) {
            return res.status(404).json({ error: 'الإعلان غير موجود' });
        }

        // تحقق من أن المستخدم هو صاحب الإعلان أو يمتلك صلاحيات "مدير" أو "مشرف"
        if (String(prop.createdBy) !== String(userId) && req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ error: 'ليس لديك الصلاحية لتفعيل هذا الإعلان' });
        }

        // تحديث حالة الإعلان إلى "مفعل" و إضافة تاريخ التفعيل
        prop.status = 'مفعل';
        prop.activatedAt = new Date();

        // حفظ التعديلات
        await prop.save();

        res.status(200).json({
            message: 'تم تفعيل الإعلان بنجاح',
            prop,
        });
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء تفعيل الإعلان', details: err });
    }
};

// 5. تعطيل إعلان
const deactivateProp = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const prop = await Prop.findById(id);
        if (!prop) {
            return res.status(404).json({ error: 'الإعلان غير موجود' });
        }

        // تحقق من أن المستخدم هو صاحب الإعلان أو يمتلك صلاحيات "مدير" أو "مشرف"
        if (String(prop.createdBy) !== String(userId) && req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ error: 'ليس لديك الصلاحية لتعطيل هذا الإعلان' });
        }

        // تحديث حالة الإعلان إلى "معطل" و إضافة تاريخ التعطيل
        prop.status = 'معطل';
        prop.disabledAt = new Date();
        prop.disabledBy = userId;

        // حفظ التعديلات
        await prop.save();

        res.status(200).json({
            message: 'تم تعطيل الإعلان بنجاح',
            prop,
        });
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء تعطيل الإعلان', details: err });
    }
};

// 6. استعراض جميع الإعلانات
const getAllProps = async (req, res) => {
    try {
        const props = await Prop.find();
        res.status(200).json(props);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء استعراض الإعلانات', details: err });
    }
};

// 7. استعراض إعلان معين
const getPropById = async (req, res) => {
    try {
        const { id } = req.params;
        const prop = await Prop.findById(id);
        if (!prop) {
            return res.status(404).json({ error: 'الإعلان غير موجود' });
        }

        res.status(200).json(prop);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء استعراض الإعلان', details: err });
    }
};

// 8. إعادة تفعيل الإعلان بعد انتهاء الصلاحية
// التحقق من الرصيد و إعادة التفعيل في حال كان autoRenew صحيحًا.
const reActivateProp = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        const prop = await Prop.findById(id);
        if (!prop) {
            return res.status(404).json({ error: 'الإعلان غير موجود' });
        }

        // تحقق من أن المستخدم هو صاحب الإعلان أو يمتلك صلاحيات "مدير" أو "مشرف"
        if (String(prop.createdBy) !== String(userId) && req.user.role !== 'admin' && req.user.role !== 'owner') {
            return res.status(403).json({ error: 'ليس لديك الصلاحية لإعادة تفعيل هذا الإعلان' });
        }

        // تحقق من رصيد المستخدم
        const user = await User.findById(userId);
        if (user.balance < prop.price) {
            // في حالة عدم وجود رصيد كافٍ
            prop.status = 'معطل';
            await prop.save();

            return res.status(400).json({
                message: 'لا يوجد رصيد كافٍ لتفعيل الإعلان، سيتم تعطيله حتى يتم شحن الرصيد.',
            });
        }

        // إذا كان الإعلان يحتاج إلى إعادة نشر تلقائي (autoRenew)
        if (prop.autoRenew) {
            // إضافة 3 أشهر جديدة إلى تاريخ الانتهاء
            prop.expirydate = new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000); // 3 أشهر

            // خصم المبلغ من رصيد المستخدم
            user.balance -= prop.price;
            await user.save();

            // تحديث حالة الإعلان إلى "مفعل" و إضافة تاريخ التفعيل
            prop.status = 'مفعل';
            prop.activatedAt = new Date();

            // حفظ التعديلات
            await prop.save();

            res.status(200).json({
                message: 'تم إعادة تفعيل الإعلان بنجاح',
                prop,
            });
        } else {
            // إذا لم يكن الإعلان مفعلاً مع خاصية التجديد التلقائي
            res.status(400).json({ message: 'الإعلان لا يحتوي على خاصية التجديد التلقائي' });
        }
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء إعادة تفعيل الإعلان', details: err });
    }
};


const searchProps = async (req, res) => {
    try {
        const {
            propType,
            city,
            area,
            minPrice,
            maxPrice,
            minRooms,
            maxRooms,
            minBathrooms,
            maxBathrooms,
            minArea,
            maxArea,
            features,
            rentPrice,
            salePrice,
            status,
            hasImages,
            expiryDateFrom,
            expiryDateTo,
            activatedFrom,
            activatedTo,
            notes,
            isFeatured // إضافة هذا الحقل لفلترة الإعلانات المميزة
        } = req.body;

        // بناء الاستعلام
        let filter = {};

        // إضافة الفلاتر حسب الحقول المختارة من المستخدم
        if (propType) filter.propType = propType;
        if (city) filter['address.city'] = city;
        if (area) filter['address.area'] = area;
        if (minPrice || maxPrice) filter['price.amount'] = {};
        if (minPrice) filter['price.amount'].$gte = minPrice;
        if (maxPrice) filter['price.amount'].$lte = maxPrice;
        if (minRooms) filter['specification.rooms'] = { $gte: minRooms };
        if (maxRooms) filter['specification.rooms'] = { $lte: maxRooms };
        if (minBathrooms) filter['specification.bathroom'] = { $gte: minBathrooms };
        if (maxBathrooms) filter['specification.bathroom'] = { $lte: maxBathrooms };
        if (minArea) filter['specification.area'] = { $gte: minArea };
        if (maxArea) filter['specification.area'] = { $lte: maxArea };
        if (features) {
            for (const feature of features) {
                filter[`features.${feature}`] = true;
            }
        }
        if (rentPrice) filter['financial.rent.price'] = { $lte: rentPrice };
        if (salePrice) filter['financial.sale.price'] = { $lte: salePrice };
        if (status) filter.status = status;
        if (hasImages) filter.images = { $exists: true, $not: { $size: 0 } };
        if (expiryDateFrom || expiryDateTo) {
            filter.expirydate = {};
            if (expiryDateFrom) filter.expirydate.$gte = new Date(expiryDateFrom);
            if (expiryDateTo) filter.expirydate.$lte = new Date(expiryDateTo);
        }
        if (activatedFrom || activatedTo) {
            filter.activatedAt = {};
            if (activatedFrom) filter.activatedAt.$gte = new Date(activatedFrom);
            if (activatedTo) filter.activatedAt.$lte = new Date(activatedTo);
        }
        if (notes) filter.notes = { $regex: notes, $options: 'i' };  // البحث في الملاحظات
        if (isFeatured !== undefined) filter.isFeatured = isFeatured;  // إضافة فلتر الإعلانات المميزة

        // إجراء البحث في قاعدة البيانات
        const properties = await Prop.find(filter).exec();
        res.json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).send('حدث خطأ في البحث');
    }
};


// 9. تمييز إعلان كمميز
const featureProp = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        // تحقق من أن المستخدم هو admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'ليس لديك الصلاحية لتفعيل هذا الإعلان كإعلان مميز' });
        }

        const prop = await Prop.findById(id);
        if (!prop) {
            return res.status(404).json({ error: 'الإعلان غير موجود' });
        }

        // تفعيل أو تعطيل الإعلان كمميز
        prop.isFeatured = !prop.isFeatured;

        // حفظ التعديلات
        await prop.save();

        res.status(200).json({
            message: `تم ${prop.isFeatured ? 'تمييز' : 'إلغاء تمييز'} الإعلان بنجاح`,
            prop,
        });
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء تعديل حالة الإعلان المميز', details: err });
    }
};

// 10. استرجاع جميع الإعلانات المميزة
const getFeaturedProps = async (req, res) => {
    try {
        // العثور على جميع الإعلانات المميزة فقط
        const featuredProps = await Prop.find({ isFeatured: true });

        if (featuredProps.length === 0) {
            return res.status(404).json({ message: 'لا توجد إعلانات مميزة حالياً' });
        }

        res.status(200).json(featuredProps);
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ أثناء استرجاع الإعلانات المميزة', details: err });
    }
};

// 13. دالة استرجاع الإعلانات الخاصة بالمستخدم
const getUserProps = async (req, res) => {
    try {
        const userId = req.user.id;  // الحصول على userId من التوكن

        // البحث عن جميع الإعلانات التي تخص المستخدم في قاعدة البيانات
        const properties = await Prop.find({ createdBy: userId });

        if (properties.length === 0) {
            return res.status(404).json({ msg: 'لا توجد إعلانات لهذا المستخدم' });
        }

        return res.status(200).json(properties);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'حدث خطأ في استرجاع الإعلانات' });
    }
};


module.exports = {
    createProp,
    updateProp,
    deleteProp,
    activateProp,
    deactivateProp,
    getAllProps,
    getPropById,
    reActivateProp,
    searchProps,
    featureProp,
    getFeaturedProps,
    getUserProps
};
