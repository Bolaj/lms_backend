const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/Cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "lms_courses", // Folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "mp4", "pdf", "docx", "pptx", "xlsx", "txt"],
  },
});

const upload = multer({ storage: storage });

module.exports = upload;