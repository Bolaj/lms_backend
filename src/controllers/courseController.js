const upload = require("../utils/fileUpload");
const logger = require("../utils/logger");
const courseService = require('../service/courseService');
const multer = require('multer');

exports.createCourse = [
  upload.single("file"),

  async (req, res) => {
    try {
      const result = await courseService.createCourse({
        body: req.body,
        file: req.file,
        user: req.user,
      });

      res.status(201).json(result);
    } catch (err) {
      if (err instanceof multer.MulterError) {
        logger.error(`Multer error during file upload: ${err.message}`);
        return res.status(400).json({ message: err.message });
      } else if (err.message === "Only PDF and MP4 files are allowed") {
        logger.error(`Invalid file type uploaded: ${err.message}`);
        return res.status(400).json({ message: err.message });
      } else {
        logger.error(`Error creating course: ${err.message}`);
        res.status(500).json({ message: "Server error", error: err.message });
      }
    }
  },
];

exports.getCourses = async (req, res) => {
  try {
    const courses = await courseService.getCourses();
    res.json(courses);
  } catch (err) {
    console.error(err); 
    res.status(500).send("Unable To Get Courses");
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    const course = await courseService.enrollStudent(req.user, req.params.courseCode);
    res.json({ message: "Enrollment successful", course });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await courseService.updateCourse(req.user, req.params.courseCode, req.body);
    res.json({ message: "Course updated successfully", course });
  } catch (err) {
    logger.error(`Error updating course: ${err.message}`);
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.softDeleteCourse = async (req, res) => {
  try {
    const course = await courseService.softDeleteCourse(req.user, req.params.courseCode);
    res.json({ message: "Course soft-deleted successfully", course });
  } catch (err) {
    logger.error(`Error during soft delete: ${err.message}`);
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.deleteCoursePermanently = async (req, res) => {
  try {
    await courseService.deleteCoursePermanently(req.user, req.params.courseCode);
    res.json({ message: "Course permanently deleted successfully" });
  } catch (err) {
    logger.error(`Error during permanent delete: ${err.message}`);
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.restoreCourse = async (req, res) => {
  try {
    const course = await courseService.restoreCourse(req.user, req.params.courseCode);
    res.json({ message: "Course restored successfully", course });
  } catch (err) {
    logger.error(`Error during restore: ${err.message}`);
    res.status(err.status || 500).json({ message: err.message });
  }
};