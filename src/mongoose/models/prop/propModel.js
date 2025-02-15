const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// تعريف هيكل البيانات (Schema)
const propSchema = new mongoose.Schema(
    {
        // 1. نوع العقار
        propType: {
            type: String,
            required: true,
        },

        // 2. معلومات العنوان
        address: {
            city: {
                type: String,
                required: true,
            },
            area: {
                type: String,
                required: true,
            },
            street: {
                type: String,
                required: true,
            },
            building: {
                type: Number,
                required: true,
            },
        },

        // 3. السعر الأساسي
        price: {
            amount: {
                type: Number,
                required: true,
            },
        },

        // 4. المواصفات
        specification: {
            rooms: {
                type: Number,
                required: true,
            },
            area: {
                type: Number,
                required: false,
            },
            floor: {
                type: Number,
                required: true,
            },
            bathroom: {
                type: Number,
                required: true,
            },
            balcony: {
                type: Number,
                required: true,
            },
            maidsRoom: {
                type: Number,
                required: false,
            },
            design: {
                type: String,
                enum: ['Duplex', 'FullDuplex'],
            },
        },

        // 5. الميزات الإضافية
        features: {
            parking: {
                type: Boolean,
                default: false,
            },
            elevator: {
                type: Boolean,
                default: false,
            },
            heating: {
                type: Boolean,
                default: false,
            },
            cooling: {
                type: Boolean,
                default: false,
            },
            furniture: {
                type: Boolean,
                default: false,
            },
            garden: {
                type: Boolean,
                default: false,
            },
            security: {
                type: Boolean,
                default: false,
            },
            waterwell: {
                type: Boolean,
                default: false,
            },
            concierge: {
                type: Boolean,
                default: false,
            },
            solarSystem: {
                type: Boolean,
                default: false,
            },
            generator: {
                type: Boolean,
                default: false,
            },
            bright: {
                type: Boolean,
                default: false,
            },
            pool: {
                type: Boolean,
                default: false,
            },
            gym: {
                type: Boolean,
                default: false,
            },
        },

        // 6. الصور
        images: {
            type: [String], // قائمة من الصور
            required: false,
            validate: {
                validator: function (value) {
                    // تحقق من أن المصفوفة تحتوي على 5 صور أو أقل
                    return value.length <= 5;
                },
                message: 'لا يمكنك رفع أكثر من 5 صور لكل إعلان',
            },
        },

        // 7. المعلومات المالية
        financial: {
            rent: {
                duration: {
                    type: String,
                    enum: ['يومي', 'أسبوعي', 'شهري', 'ربع سنوي', 'نصف سنوي', 'سنوي'],
                    required: true,
                },
                period: {
                    type: Number,
                    required: true,
                },
                price: {
                    type: Number,
                    required: false,
                },
                cost: { // الحقل الجديد لحساب تكلفة الإيجار
                    type: Number,
                    required: false,
                    default: 0
                }
            },
            sale: {
                price: {
                    type: Number,
                    required: false,
                },
            },
            investment: {
                price: {
                    type: Number,
                    required: false,
                },
            },

            // تحقق مخصص لضمان أن واحدًا من الحقول التالية تم تحديده
            requiredFinancialField: {
                type: String,
                validate: {
                    validator: function () {
                        return (
                            this.financial.rent.price ||
                            this.financial.sale.price ||
                            this.financial.investment.price
                        );
                    },
                    message:
                        'One of rent, sale, or investment must be specified with a price.',
                },
            },
        },

        // 8. تاريخ انتهاء الصلاحية
        expirydate: {
            type: Date,
            default: function () {
                const createdDate = this.createdAt; // استخدم تاريخ الإنشاء
                const expiryDate = new Date(createdDate); // نسخ تاريخ الإنشاء
                expiryDate.setMonth(expiryDate.getMonth() + 3); // إضافة 3 أشهر
                return expiryDate; // إرجاع تاريخ الانتهاء بعد 3 أشهر
            },
        },
    },
    { timestamps: true }
);

// إضافة دالة `pre-save` لحساب `cost` قبل حفظ المستند
/* propSchema.pre('save', function (next) {
    if (this.rent && this.rent.price && this.rent.period && this.rent.duration) {
        let cost = 0;

        // حساب التكلفة بناءً على الفترة المحددة
        switch (this.rent.duration) {
            case 'يومي':
                cost = this.rent.price * this.rent.period; // السعر اليومي * عدد الأيام
                break;
            case 'أسبوعي':
                cost = this.rent.price * this.rent.period * 7; // السعر الأسبوعي * عدد الأسابيع * 7 (أيام)
                break;
            case 'شهري':
                cost = this.rent.price * this.rent.period * 30; // السعر الشهري * عدد الشهور * 30 (أيام)
                break;
            case 'ربع سنوي':
                cost = this.rent.price * this.rent.period * 90; // السعر ربع السنوي * عدد الفترات * 90 (أيام)
                break;
            case 'نصف سنوي':
                cost = this.rent.price * this.rent.period * 180; // السعر نصف السنوي * عدد الفترات * 180 (أيام)
                break;
            case 'سنوي':
                cost = this.rent.price * this.rent.period * 365; // السعر السنوي * عدد السنوات * 365 (أيام)
                break;
            default:
                break;
        }

        // تعيين قيمة cost في الحقل
        this.rent.cost = cost;
    }

    next();
}); */

// إنشاء النموذج بناءً على المخطط
const Prop = mongoose.model('Prop', propSchema);

module.exports = Prop;
