const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const { sendEmail } = require("../utils/emailService");
const logger = require("../utils/logger");
const moment = require("moment");

exports.createAssignment = async (user, body) => {
  if (user.role !== "teacher") {
    throw { status: 403, message: "Only teachers can create assignments" };
  }

  const { title, description, dueDate, course } = body;

  const assignment = new Assignment({ title, description, dueDate, course });
  await assignment.save();

  const courseDetails = await Course.findById(course).populate("students", "email");
  if (!courseDetails) {
    throw { status: 404, message: "Course not found" };
  }

  const studentEmails = courseDetails.students.map((student) => student.email);
  const emailSubject = `New Assignment: ${title}`;
  const emailText = `A new assignment has been created for the course "${courseDetails.title}".\n\n` +
    `Title: ${title}\nDescription: ${description}\nDue Date: ${dueDate}\nAssignment ID: ${assignment._id}\n\n` +
    `Please log in to view and submit the assignment.`;

  for (const email of studentEmails) {
    try {
      await sendEmail(email, emailSubject, emailText);
    } catch (emailError) {
      logger.error(`Failed to send email to: ${email}. Error: ${emailError.message}`);
    }
  }

  return assignment;
};

exports.getAssignments = async () => {
  return await Assignment.find().populate("course", "title");
};

exports.submitAssignment = async (user, assignmentId, fileUrl) => {
  if (user.role !== "student") {
    throw { status: 403, message: "Only students can submit assignments" };
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw { status: 404, message: "Assignment not found" };
  }

  if (new Date() > new Date(assignment.dueDate)) {
    throw { status: 403, message: "The due date has passed. Submissions are no longer allowed." };
  }

  const submission = { student: user.id, fileUrl };
  assignment.submissions.push(submission);
  await assignment.save();
  return assignment;
};

exports.sendAssignmentReminders = async ({ excludeExpired = false } = {}) => {
  const now = moment();
  const oneDayBefore = moment().add(1, "days").toDate();

  const query = { dueDate: { $lte: oneDayBefore } };
  if (excludeExpired) {
    query.dueDate.$gte = now.toDate();
  }

  const assignments = await Assignment.find(query).populate("course", "title students");

  for (const assignment of assignments) {
    const courseDetails = await Course.findById(assignment.course._id).populate("students", "email");
    if (!courseDetails) continue;

    const studentEmails = courseDetails.students.map((s) => s.email);
    const subject = `Reminder: Assignment "${assignment.title}" is due soon`;
    const text = `Reminder: Assignment "${assignment.title}" for course "${courseDetails.title}" is due on ${moment(assignment.dueDate).format("YYYY-MM-DD HH:mm")}.`;

    for (const email of studentEmails) {
      await sendEmail(email, subject, text);
    }
  }

  return;
};

exports.editAssignmentDueDate = async (user, assignmentId, newDueDate) => {
  if (user.role !== "teacher") {
    throw { status: 403, message: "Only teachers can edit assignment due dates" };
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw { status: 404, message: "Assignment not found" };
  }

  if (new Date(newDueDate) <= new Date()) {
    throw { status: 400, message: "The new due date must be in the future" };
  }

  assignment.dueDate = newDueDate;
  await assignment.save();
  return assignment;
};
