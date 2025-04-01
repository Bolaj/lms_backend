const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    courseCode: { 
        type: String, unique: true, required: true
    },
    title: { 
        type: String, required: true 
    },
    description: { type: String },
    teacher: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    fileUrl: { type: String },
    deleted: { type: Boolean, default: false }, 

    students: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", CourseSchema);
