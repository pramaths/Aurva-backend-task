const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://pramaths848:MdNy3gukvjpzydQe@twitter.t29mhxx.mongodb.net/scanner?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error', { error });
    process.exit(1);
  }
};

module.exports = connectDB;