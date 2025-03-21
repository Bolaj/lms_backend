const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema(
  {
    title: { 
        type: String, 
        required: true 
    },
    description: { type: String },
    dueDate: { 
        type: Date, 
        required: true 
    },
    course: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Course", 
        required: true 
    },
    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        fileUrl: { type: String },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", AssignmentSchema);