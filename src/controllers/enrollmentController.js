const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/user");
const transporter = require("../utils/emailService");

// Student requests enrollment
exports.requestEnrollment = async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ msg: "Only students can request enrollment" });
  }
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId).populate("teacher", "email name");
    if (!course) return res.status(404).json({ msg: "Course not found" });

    const enrollment = new Enrollment({ student: req.user.id, course: courseId, status: "pending" });
    await enrollment.save();

    // Notify teacher
    await transporter.sendMail({
      from: "process.env.EMAIL_USER",
      to: course.teacher.email,
      subject: "Enrollment Request",
      text: `${req.user.name} has requested to enroll in ${course.title}. Approve/Reject in dashboard.`
    });
    res.status(201).json({ msg: "Enrollment request sent" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Teacher approves/denies enrollment
exports.approveEnrollment = async (req, res) => {
  if (req.user.role !== "teacher") return res.status(403).json({ msg: "Unauthorized" });
  try {
    const { enrollmentId, action } = req.body; // action = 'approved' or 'denied'
    const enrollment = await Enrollment.findById(enrollmentId).populate("student", "email name");
    if (!enrollment) return res.status(404).json({ msg: "Enrollment not found" });

    enrollment.status = action;
    await enrollment.save();

    // Notify student
    await transporter.sendMail({
      from: "process.env.EMAIL_USER",
      to: enrollment.student.email,
      subject: `Enrollment ${action}`,
      text: `Your enrollment for ${enrollment.course} has been ${action}.`
    });
    res.json({ msg: `Enrollment ${action}` });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Fetch all pending enrollments for a teacher
exports.getPendingEnrollments = async (req, res) => {
  if (req.user.role !== "teacher") return res.status(403).json({ msg: "Unauthorized" });
  try {
    const pendingEnrollments = await Enrollment.find({ status: "pending" })
      .populate("student", "name email")
      .populate("course", "title");
    res.json(pendingEnrollments);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Fetch enrollment history for a student
exports.getEnrollmentHistory = async (req, res) => {
  if (req.user.role !== "student") return res.status(403).json({ msg: "Unauthorized" });
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate("course", "title status");
    res.json(enrollments);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

// Send automatic reminders for pending enrollments
const sendEnrollmentReminders = async () => {
  try {
    const pendingEnrollments = await Enrollment.find({ status: "pending" }).populate("course teacher");
    pendingEnrollments.forEach(async (enrollment) => {
      await transporter.sendMail({
        from: "process.env.EMAIL_USER",
        to: enrollment.course.teacher.email,
        subject: "Pending Enrollment Reminder",
        text: `You have a pending enrollment request for ${enrollment.course.title}. Please review it.`
      });
    });
  } catch (err) {
    console.error("Error sending reminders:", err);
  }
};

//Set interval to send reminders every 24 hours
setInterval(sendEnrollmentReminders, 24 * 60 * 60 * 1000);


//Remove a Student from a Course (by Teacher/Admin)
exports.removeStudent = async (req, res) => {
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Only teachers and admins can remove students" });
    }
  
    try {
      const { courseId, studentId } = req.body;
  
      // Check if the course exists
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ msg: "Course not found" });
      }
  
      // Check if the requesting user is the teacher of the course (if not an admin)
      if (req.user.role === "teacher" && course.teacher.toString() !== req.user.id) {
        return res.status(403).json({ msg: "Teachers can only remove students from their own courses" });
      }
  
      // Find and delete the enrollment record
      const enrollment = await Enrollment.findOneAndDelete({ student: studentId, course: courseId });
  
      if (!enrollment) {
        return res.status(404).json({ msg: "Student is not enrolled in this course" });
      }
  
      res.json({ msg: "Student successfully removed from the course" });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  };