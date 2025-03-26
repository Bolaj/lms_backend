const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/Cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      let folder = "general_uploads";
  
      if (file.mimetype.startsWith("image/")) {
        folder = "course_thumbnails";
      } else if (file.mimetype.startsWith("video/")) {
        folder = "course_videos";
        return { folder, resource_type: "video" };
      } else if (
        ["application/pdf", 
         "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
         "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
         "application/vnd.ms-excel", // XLS
         "text/plain", // TXT
         "application/zip" // ZIP for bulk uploads
        ].includes(file.mimetype)
      ) {
        folder = "course_materials";
      }
  
      return { folder };
    },
  });
  
  // File Filter and Size Restriction
  const fileFilter = (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif",
      "video/mp4", "video/mpeg",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
      "application/vnd.ms-excel", // XLS
      "text/plain", // TXT
      "application/zip" // ZIP
    ];
  
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type!"), false);
    }
  };
  
  // Max File Size (10MB)
  const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter,
  });
  
  module.exports = upload;  