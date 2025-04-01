const cloudinary = require("cloudinary").v2;
const logger = require("../utils/logger");
try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  
    logger.info("Cloudinary configuration successful.");
  } catch (error) {
    logger.error("Error configuring Cloudinary: " + error.message);
  }
module.exports = cloudinary;