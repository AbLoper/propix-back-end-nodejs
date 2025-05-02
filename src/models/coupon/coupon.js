// models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },  // الكود الفريد
    value: { type: Number, required: true },  // القيمة
    expirationDate: { type: Date, required: true },  // تاريخ الصلاحية
    used: { type: Boolean, default: false },  // حالة الكوبون (مستخدم/غير مستخدم)
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }  // المستخدم الذي يملك الكوبون
});

module.exports = mongoose.model('Coupon', couponSchema);
