const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// تعريف هيكل البيانات (Schema)
const propSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 8,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    }
});

// إنشاء نموذج مستخدم باستخدام الـ Schema
const Prop = mongoose.model('Prop', userSchema);

// تصدير النموذج
module.exports = Prop;
