const Course = require("../models/course");
const { validationResult } = require("express-validator");


exports.createCourse = async (req, res) => {
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, price, category } = req.body;

    
    if (req.user.role !== "teacher") {
      return res.status(403).json({ message: "Only teachers can create courses" });
    }

    const course = new Course({
      title,
      description,
      price,
      category,
      instructor: req.user._id,
    });

    await course.save();
    return res.status(201).json({ message: "Course created successfully", course });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, price, category } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the instructor or an admin can update this course" });
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.price = price || course.price;
    course.category = category || course.category;

    await course.save();
    return res.status(200).json({ message: "Course updated successfully", course });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the instructor or an admin can delete this course" });
    }

    await course.deleteOne();
    return res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("instructor", "firstName lastName email")
      .populate("studentsEnrolled", "firstName lastName email"); 

    return res.status(200).json({ message: "Courses retrieved successfully", courses });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate("instructor", "firstName lastName email")
      .populate("studentsEnrolled", "firstName lastName email")

    if (!course) return res.status(404).json({ message: "Course not found" });

    return res.status(200).json({ message: "Course retrieved successfully", course });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
