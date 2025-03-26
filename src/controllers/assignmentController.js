const Assignment = require("../models/Assignment");
const { sendEmail } = require("../utils/emailService");
const Course = require('../models/Course')

exports.createAssignment = async (req, res) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ msg: "Only teachers can create assignments" });
  }

  const { title, description, dueDate, course } = req.body;
  try {
    const assignment = new Assignment({
      title,
      description,
      dueDate,
      course,
    });

    await assignment.save();

    const courseDetails = await Course.findById(course).populate("students", "email");
    if (!courseDetails) {
      return res.status(404).json({ message: "Course not found" });
    }

    const studentEmails = courseDetails.students.map((student) => student.email);
    const emailSubject = `New Assignment: ${title}`;
    const emailText = `A new assignment has been created for the course "${courseDetails.title}".\n\nTitle: ${title}\nDescription: ${description}\nDue Date: ${dueDate}\n\nPlease log in to your account to view and submit the assignment.`;

    for (const email of studentEmails) {
      await sendEmail(email, emailSubject, emailText);
    }

    res.status(201).json({ message: "Assignment created and emails sent", assignment });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().populate("course", "title");
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

exports.submitAssignment = async (req, res) => {
  if (req.user.role !== "student") {
    return res.status(403).json({ msg: "Only students can submit assignments" });
  }

  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ msg: "Assignment not found" });
    }

    const submission = {
      student: req.user.id,
      fileUrl: req.body.fileUrl,
    };

    assignment.submissions.push(submission);
    await assignment.save();
    res.json({ msg: "Assignment submitted successfully", assignment });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
const cron = require("node-cron");
const moment = require("moment");

exports.sendAssignmentReminders = async () => {
  try {
    const now = moment();
    const oneDayBefore = now.add(1, "days").toDate();
    const twoHoursBefore = now.add(2, "hours").toDate();

    const assignments = await Assignment.find({
      dueDate: { $gte: now.toDate(), $lte: oneDayBefore },
    }).populate("course", "title students");

    for (const assignment of assignments) {
      const courseDetails = await Course.findById(assignment.course._id).populate(
        "students",
        "email"
      );

      if (!courseDetails) continue;

      const studentEmails = courseDetails.students.map((student) => student.email);
      const emailSubject = `Reminder: Assignment "${assignment.title}" is due soon`;
      const emailText = `This is a reminder that the assignment "${assignment.title}" for the course "${courseDetails.title}" is due on ${moment(
        assignment.dueDate
      ).format("YYYY-MM-DD HH:mm")}. Please ensure you submit it on time.`;

      for (const email of studentEmails) {
        await sendEmail(email, emailSubject, emailText);
      }
    }

    console.log("Reminders sent successfully.");
  } catch (err) {
    console.error("Error sending reminders:", err);
  }
};