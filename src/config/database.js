const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectToDatabase = async () => {
    try {
        const DB_HOST = process.env.DB_HOST;

        if (!DB_HOST) {
            console.error('MONGO_URI is not defined in the environment variables');
            return;
        }

        // الاتصال بقاعدة البيانات بدون الخيارات القديمة
        await mongoose.connect(DB_HOST);

        console.log('Database connection established successfully');
    } catch (error) {
        console.error('Database connection error:', error.message);
    }
};

connectToDatabase();
