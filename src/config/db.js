const mongoose = require('mongoose')

const dotenv = require ('dotenv')
dotenv.config()

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000
const db = async (retries = MAX_RETRIES) => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    if (retries > 0) {
      console.log(`🔁 Retrying to connect in ${RETRY_DELAY_MS / 1000}s... (${retries} retries left)`);
      setTimeout(() => db(retries - 1), RETRY_DELAY_MS);
    } else {
      console.error('❌ Failed to connect to MongoDB after multiple attempts');
      process.exit(1); 
    }
  }
};
module.exports = db



