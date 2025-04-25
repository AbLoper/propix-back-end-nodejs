const { default: mongoose } = require('mongoose');
const moment = require('moment');

const propSchema = new mongoose.Schema(
    {
        // 1. معلومات أساسية عن العقار
        propType: {
            type: String,
            required: true,
        },

        transactionType: {
            type: String,
            enum: ['rent', 'sale', 'investment'],
            required: true,
        },

        address: {
            city: { type: String, required: true },
            area: { type: String, required: true },
            street: { type: String, required: true },
            building: { type: Number, required: true },
            floor: { type: Number, required: true },
            apartment: { type: Number, required: false },
        },

        // 3. المواصفات الأساسية
        specification: {
            rooms: { type: Number, required: true },
            area: { type: Number, required: false },
            floor: { type: Number, required: true },
            bathroom: { type: Number, required: true },
            balcony: { type: Number, required: true },
            maidsRoom: { type: Number, required: false },
            design: { type: String, enum: ['Duplex', 'FullDuplex'], required: false },
        },

        // 4. الميزات الإضافية
        features: {
            parking: { type: Boolean, default: false },
            elevator: { type: Boolean, default: false },
            heating: { type: Boolean, default: false },
            cooling: { type: Boolean, default: false },
            furniture: { type: Boolean, default: false },
            garden: { type: Boolean, default: false },
            security: { type: Boolean, default: false },
            waterwell: { type: Boolean, default: false },
            concierge: { type: Boolean, default: false },
            solarSystem: { type: Boolean, default: false },
            generator: { type: Boolean, default: false },
            bright: { type: Boolean, default: false },
            pool: { type: Boolean, default: false },
            gym: { type: Boolean, default: false },
        },

        // 5. المعلومات المالية (إيجار، بيع، استثمار)
        financial: {

            price: {
                amount: { type: Number, required: true, min: 10, max: 10000 }, // إضافة تحقق من أن السعر لا يمكن أن يكون سالبًا.
                currency: { type: String, required: true, default: 'USD', enum: ['USD'] },
            },
            duration: {
                type: String,
                enum: ['يومي', 'أسبوعي', 'شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي'],
                required: false,
            },
            // period: { type: Number, required: false },
            fee: {
                type: Number,
                required: true,
                validate: {
                    validator: function(value) {
                        // تحقق من أن الرسوم مناسبة للقيمة التي تم تحديدها
                        if (this.financial.type === 'rent' && value !== this.financial.price.amount * 0.05) {
                            return false; // إذا كانت الرسوم لا تتوافق مع نسبة الإيجار
                        }
                        if (this.financial.type === 'sale' && value !== this.financial.price.amount * 0.01) {
                            return false; // إذا كانت الرسوم لا تتوافق مع نسبة البيع
                        }
                        return true; // القيمة صحيحة
                    },
                    message: 'القيمة المدخلة للرسوم غير صحيحة وفقًا لنوع المعاملة.',
                },
            },

            paymentMethod: {
                type: String,
                enum: ['funds', 'coupon'],
            },
        },

        // 6. التواريخ
        expirydate: {
            type: Date,
            default: () => moment().add(1, 'year').toDate()


            /*  default: function () {
                // تحديد فترة صلاحية بناءً على نوع المعاملة المالية (بيع، إيجار، استثمار)
                let duration = 3 * 30 * 24 * 60 * 60 * 1000; // 3 أشهر كإفتراضي
                if (this.financial.rent && this.financial.rent.duration) {
                    switch (this.financial.rent.duration) {
                        case 'يومي':
                            duration = 1 * 24 * 60 * 60 * 1000;  // يوم
                            break;
                        case 'أسبوعي':
                            duration = 7 * 24 * 60 * 60 * 1000;  // أسبوع
                            break;
                        case 'شهري':
                            duration = 30 * 24 * 60 * 60 * 1000; // شهر
                            break;
                        default:
                            break;
                    }
                }
                return new Date(Date.now() + duration);
            } */
        },

        // 7. من قام بإجراء التعديلات
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        disabledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // 8. حالة الإعلان
        status: {
            type: String,
            enum: ['approved', 'disabled', 'waiting', 'rejected', 'expired'],
            default: 'waiting',
            index: true,
        },
        autoRepost: {
            type: Boolean,
            default: false,
            set: function (value) {
                if (this.expirydate && new Date(this.expirydate) <= Date.now()) {
                    return false;
                }
                if (this.status === 'expired') {
                    return false;
                }
                return value;
            },
        },

        // 9. المرفقات والملفات
        images: {
            type: [String],
            validate: {
                validator: (value) => {
                    // return value.length >= 1 && value.length <= 5 && value.every(img => img.match(/\.(jpeg|jpg|png)$/i));
                    return value.length >= 1 && value.length <= 5 && value.every(img => img.match(/\.(jpeg|jpg|png)$/i) && img.size <= 5 * 1024 * 1024);  // التحقق من حجم الصورة

                },
                message: 'يجب أن تحتوي المصفوفة على صورة واحدة على الأقل بصيغة JPEG أو jpg أو PNG وألا تتجاوز 5 صور.',
            },
            required: true,
        },        

        note: {
            type: String,
            maxlength: 100,
            required: false,
        },

        // 10. خصائص الإعلان
        isFeatured: { type: Boolean, default: false },

    },
    { timestamps: true }
);

propSchema.virtual('feeCalculated').get(function() {
    if (this.financial.type === 'rent') {
        return this.financial.price.amount * 0.05;
    } else if (this.financial.type === 'sale') {
        return this.financial.price.amount * 0.01;
    }
    return 0;
});


// إنشاء نموذج مستخدم باستخدام الـ Schema
const Prop = mongoose.model('Prop', propSchema);

// تصدير النموذج
module.exports = Prop;
