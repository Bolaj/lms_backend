const Assignment = require("../models/Assignment");
const { sendEmail } = require("../utils/emailService");
const Course = require('../models/Course')
const logger = require("../utils/logger");
const moment = require("moment");
exports.createAssignment = async (req, res) => {
  logger.info("createAssignment Endpoint called");
  if (req.user.role !== "teacher") {
    logger.warn("Unauthorized access attempt to createAssignment");

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
    logger.info("Assignment created successfully");
    await assignment.save();
    const courseDetails = await Course.findById(course).populate("students", "email");
    if (!courseDetails) {
      logger.warn(`Course not found with ID: ${course}`);
      return res.status(404).json({ message: "Course not found" });
    }

    const studentEmails = courseDetails.students.map((student) => student.email);
    const emailSubject = `New Assignment: ${title}`;
    const emailText = `A new assignment has been created for the course "${courseDetails.title}".\n\n` +
      `Assignment Details:\n` +
      `Title: ${title}\n` +
      `Description: ${description}\n` +
      `Due Date: ${dueDate}\n` +
      `Assignment ID: ${assignment._id}\n\n` + 
      `Please log in to your account to view and submit the assignment.`;

      for (const email of studentEmails) {
        try {
          logger.info(`Attempting to send email to: ${email}`);
          await sendEmail(email, emailSubject, emailText);
          logger.info(`Email sent successfully to: ${email}`);
        } catch (emailError) {
          logger.error(`Failed to send email to: ${email}. Error: ${emailError.message}`);
        }
      }

    logger.info("All email attempts completed");

    res.status(201).json({ message: "Assignment created and emails sent", assignment });
  } catch (err) {
    logger.error("Error creating assignment: " + err.message);
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
  logger.info("submitAssignment Endpoint called");
  if (req.user.role !== "student") {
    logger.warn("Unauthorized access attempt to submitAssignment");
    return res.status(403).json({ msg: "Only students can submit assignments" });
  }

  try {

    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment) {
      logger.warn(`Assignment not found with ID: ${req.params.assignmentId}`);
      return res.status(404).json({ msg: "Assignment not found" });
    }

    // Check if the assignment's due date has passed
    if (new Date() > new Date(assignment.dueDate)) {
      logger.warn(`Due date passed for assignment ID: ${req.params.assignmentId}`);
      return res.status(403).json({ msg: "The due date for this assignment has passed. Submissions are no longer allowed." });
    }

    const submission = {
      student: req.user.id,
      fileUrl: req.body.fileUrl,
    };

    assignment.submissions.push(submission);
    logger.info(`Assignment submitted successfully by student ID: ${req.user.id}`);
    await assignment.save();
    res.json({ msg: "Assignment submitted successfully", assignment });
  } catch (err) {
    logger.error("Error submitting assignment: " + err.message);
    res.status(500).send("Server error");
  }
};


exports.sendAssignmentReminders = async ({ excludeExpired = false } = {}) => {
  try {
    logger.info("sendAssignmentReminders function called");

    const now = moment();
    const oneDayBefore = moment().add(1, "days").toDate();

    const query = {
      dueDate: { $gte: now.toDate() }, 
    };

    if (excludeExpired) {
      query.dueDate.$gte = now.toDate(); 
    }

    const assignments = await Assignment.find({
      ...query,
      dueDate: { $lte: oneDayBefore }, 
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

    logger.info("Reminders sent successfully.");
  } catch (err) {
    logger.error("Error sending reminders: " + err.message);
  }
};
