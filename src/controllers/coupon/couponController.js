// controllers/couponController.js
const Coupon = require('../models/Coupon');
const User = require('../models/User');

// إضافة كوبون للمستخدم
const addCoupon = async (req, res) => {
    const { code, value, expirationDate } = req.body;
    
    try {
        // تحقق من وجود الكوبون مسبقًا
        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) {
            return res.status(400).json({ message: 'الكوبون موجود بالفعل' });
        }

        // إضافة كوبون جديد
        const newCoupon = new Coupon({
            code,
            value,
            expirationDate,
            user: req.user._id  // ربط الكوبون بالمستخدم الذي أضافه
        });

        await newCoupon.save();
        
        return res.status(201).json({
            message: 'تم إضافة الكوبون بنجاح',
            coupon: newCoupon
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'حدث خطأ أثناء إضافة الكوبون', error: error.message });
    }
};

module.exports = { addCoupon };
