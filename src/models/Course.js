const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    thumbnail: { type: String }, // Image URL from Cloudinary
    videoLectures: [{ type: String }], // Array of video URLs
    courseMaterials: [{ type: String }], // PDFs or other docs
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);