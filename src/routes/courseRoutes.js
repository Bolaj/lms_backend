const express = require("express");
const courseRouter = express.Router();
const { 
  createCourse, 
  getCourses, 
  getCourseById, 
  updateCourse, 
  deleteCourse 
} = require("../controllers/courseController");
const upload = require("../auth/multer"); // Multer for file uploads
const auth = require("../auth/authMiddleware"); // Authentication middleware

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Only teachers & admins)
courseRouter.post(
  "/", 
  auth, 
  upload.fields([
    { name: "thumbnail", maxCount: 1 }, 
    { name: "videos", maxCount: 5 }, 
    { name: "materials", maxCount: 10 }
  ]), 
  createCourse
);

// @route   GET /api/courses
// @desc    Get all courses
// @access  Public
courseRouter.get("/", getCourses);

// @route   GET /api/courses/:id
// @desc    Get a single course by ID
// @access  Public
outer.get("/:id", getCourseById);

// @route   PUT /api/courses/:id
// @desc    Update a course
// @access  Private (Only course creator & admins)
courseRouter.put(
  "/:id", 
  auth, 
  upload.fields([
    { name: "thumbnail", maxCount: 1 }, 
    { name: "videos", maxCount: 5 }, 
    { name: "materials", maxCount: 10 }
  ]), 
  updateCourse
);

// @route   DELETE /api/courses/:id
// @desc    Delete a course
// @access  Private (Only course creator & admins)
courseRouter.delete("/:id", auth, deleteCourse);

module.exports = courseRouter;