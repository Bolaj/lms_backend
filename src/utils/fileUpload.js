const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinaryConfig");


const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "courses", 
    allowed_formats: ["pdf", "mp4"], 
    resource_type: "auto", 
  },
});


const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "video/mp4"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); 
    } else {
      cb(new Error("Only PDF and MP4 files are allowed")); 
    }
  },
});

module.exports = upload;