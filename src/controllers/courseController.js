const Course = require("../models/Course");
const upload = require("../utils/fileUpload");
const logger = require("../utils/logger");

exports.createCourse = [
  upload.single("file"), 
  async (req, res) => {
    
    try {
      logger.info("createCourse Endpoint called");
      if (req.user.role !== "teacher" && req.user.role !== "admin") {
        logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`);
        return res.status(403).json({
          message: "Access denied! Only Teachers and Admins are authorized to create Courses",
        });
      }

      const { courseCode, title, description, teacherId } = req.body;

      if (req.user.role === "admin" && !teacherId) {
        logger.warn(`Admin user ${req.user.id} attempted to create a course without providing a teacherId`);
        return res.status(400).json({
          message: "Teacher ID is required to assign a teacher to the course",
        });
      }
      const existingCourse = await Course.findOne({ courseCode });
      if (existingCourse) {
        logger.warn(`Course creation failed: Course with code '${courseCode}' already exists`);
        return res.status(400).json({
          message: `A course with the code '${courseCode}' already exists.`,
        });
      }

      
      let fileUrl = null;
      if (req.file) {
        fileUrl = req.file.path; 
        logger.info(`File uploaded successfully: ${fileUrl}`);
      } else {
        logger.info("No file uploaded for the course");
      }

      const course = new Course({
        courseCode,
        title,
        description,
        teacher: req.user.role === "teacher" ? req.user.id : teacherId,
        fileUrl, 
      });

      await course.save();
      logger.info(`Course created successfully: ${courseCode} by user ${req.user.id}`);

      res.status(201).json({
        message: "Course created successfully",
        course,
      });
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
    logger.info("getCourses Endpoint called");
    const courses = await Course.find().populate("teacher", "name email");
    res.json(courses);
  } catch (err) {
    logger.error(`Error fetching courses: ${err.message}`);
    res.status(500).send("Unable To Get Courses", err.message);

  }
};

exports.enrollStudent = async (req, res) => {
  logger.info("enrollStudent Endpoint called");
  if (req.user.role !== "student") {
    logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`);
    return res.status(401).json({ message: "Only students can enroll" });
  }

  try {
    const course = await Course.findOne({ courseCode: req.params.courseCode });
    if (!course) {
      logger.warn(`Enrollment failed: Course with code '${req.params.courseCode}' not found`);
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.students.includes(req.user.id)) {
      logger.warn(`Enrollment failed: Student ${req.user.id} is already enrolled in course '${req.params.courseCode}'`);
      return res.status(400).json({ message: "Already enrolled" });
    }

    course.students.push(req.user.id);
    logger.info(`Student ${req.user.id} enrolled in course '${req.params.courseCode}'`);
    await course.save();

    res.json({ message: "Enrollment successful", course });
  } catch (err) {
    logger.error(`Error during enrollment: ${err.message}`);
    res.status(500).send("Server error");
  }
};
exports.updateCourse = async (req, res) => {
  try {
    logger.info("updateCourse Endpoint called");
    const course = await Course
      .findOne
      ({ courseCode: req.params.courseCode });
    if (!course) {
      logger.warn(`Update failed: Course with code '${req.params.courseCode}' not found`);
      return res.status(404).json({ message: "Course not found" });
    }
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`);
      return res.status(403).json({

        message: "Access denied! Only Teachers and Admins are authorized to update Courses",
      });
    }
    if (req.user.role === "teacher" && course.teacher.toString() !== req.user.id) {
      logger.warn(`Update failed: Teacher ${req.user.id} attempted to update a course they do not own`);
      return res.status(403).json({
        message: "Access denied! You are not authorized to update this course",
      });
    }
    const { courseCode, title, description } = req.body;
    course.courseCode = courseCode || course.courseCode;
    course.title = title || course.title;
    course.description = description || course.description;

    logger.info(`Course updated successfully: ${courseCode} by user ${req.user.id}`);
    await course.save();

    res.json({ message: "Course updated successfully", course });
  } catch (err) {
    logger.error(`Error updating course: ${err.message}`);
    res.status(500).send("Server error", err.message);
  }

}
exports.softDeleteCourse = async (req, res) => {
  logger.info("softDeleteCourse Endpoint called");
  try {
    
    const course = await Course.findOne({ courseCode: req.params.courseCode });
    if (!course) {
      logger.warn(`Soft delete failed: Course with code '${req.params.courseCode}' not found`);
      return res.status(404).json({ message: "Course not found" });
    }

    if (req.user.role !== "admin") {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`);
      return res.status(403).json({ message: "Access denied! Only admins can delete courses" });
    }

    course.deleted = true; 

    logger.info(`Course soft-deleted successfully: ${req.params.courseCode} by user ${req.user.id}`);
    await course.save();

    res.json({ message: "Course soft-deleted successfully", course });
  } catch (err) {
    logger.error(`Error during soft delete: ${err.message}`);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.deleteCoursePermanently = async (req, res) => {
  logger.info("deleteCoursePermanently Endpoint called");
  try {
    const course = await Course.findOne({ courseCode: req.params.courseCode });
    if (!course) {
      logger.warn(`Permanent delete failed: Course with code '${req.params.courseCode}' not found`);
      return res.status(404).json({ message: "Course not found" });
    }

    if (req.user.role !== "admin") {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`);
      return res.status(403).json({ message: "Access denied! Only admins can delete courses permanently" });
    }

    logger.info(`Course permanently deleted: ${req.params.courseCode} by user ${req.user.id}`);
    await Course.deleteOne({ courseCode: req.params.courseCode }); 
    res.json({ message: "Course permanently deleted successfully" });
  } catch (err) {
    logger.error(`Error during permanent delete: ${err.message}`);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.restoreCourse = async (req, res) => {
  logger.info("restoreCourse Endpoint called");
  try {
    const course = await Course.findOne({ courseCode: req.params.courseCode });
    if (!course) {
      logger.warn(`Restore failed: Course with code '${req.params.courseCode}' not found`);
      return res.status(404).json({ message: "Course not found" });
    }

    if (req.user.role !== "admin") {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`);
      return res.status(403).json({ message: "Access denied! Only admins can restore courses" });
    }

    course.deleted = false; 
    logger.info(`Course restored successfully: ${req.params.courseCode} by user ${req.user.id}`);
    await course.save();

    res.json({ message: "Course restored successfully", course });
  } catch (err) {
    logger.error(`Error during restore: ${err.message}`);
    
    res.status(500).json({ message: "Server error", error: err.message });
  }
};