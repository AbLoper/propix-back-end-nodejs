const express = require('express');
const cors = require('cors');
const corsOptions = require('../config/cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

module.exports = (app) => {
    // تمكين CORS
    app.use(cors(corsOptions));
    // تمكين helmet لتحسين الأمان
    app.use(helmet());
    // تمكين cookie-parser لتحليل ملفات تعريف الارتباط
    app.use(cookieParser());
    // تمكين الـ URL-encoded في الطلبات الواردة
    app.use(express.urlencoded({ extended: true }));
    // تمكين الـ JSON في الطلبات الواردة
    app.use(express.json());
    // تمكين الـ static files في المسارات الواردة
    app.use(express.static('public'));
    // تمكين الوصول إلى الملفات المرفوعة
    app.use(express.static('uploads'));
    // تمكين السجلات
    app.use(morgan('dev'));
};