const Course = require("../models/Course");

exports.createCourse = async (req, res) => {
  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied! Only Aeachers and Admins are authorzed to create Courses" });
  }

  const { title, description } = req.body;
  try {
    const course = new Course({
        courseCode,
        title,
        description,
        teacher: req.user.role === "teacher" ? req.user.id : teacherId,
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("teacher", "name email");
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.enrollStudent = async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ msg: "Only students can enroll" });
  }

  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ msg: "Course not found" });
    }

    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ msg: "Already enrolled" });
    }

    course.students.push(req.user.id);
    await course.save();
    res.json({ msg: "Enrollment successful", course });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};