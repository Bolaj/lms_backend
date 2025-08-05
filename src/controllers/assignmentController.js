const assignmentService = require("../service/assignmentService");
const logger = require("../utils/logger");

exports.createAssignment = async (req, res) => {
  logger.info("createAssignment Endpoint called");
  try {
    const assignment = await assignmentService.createAssignment(req.user, req.body);
    res.status(201).json({ message: "Assignment created and emails sent", assignment });
  } catch (err) {
    logger.error("Error creating assignment: " + err.message);
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.getAssignments = async (req, res) => {
  logger.info("getAssignments Endpoint called");
  try {
    const assignments = await assignmentService.getAssignments();
    res.json(assignments);
  } catch (err) {
    logger.error("Error fetching assignments: " + err.message);
    res.status(500).send("Server error");
  }
};

exports.submitAssignment = async (req, res) => {
  logger.info("submitAssignment Endpoint called");
  try {
    const assignment = await assignmentService.submitAssignment(
      req.user,
      req.params.assignmentId,
      req.body.fileUrl
    );
    res.json({ msg: "Assignment submitted successfully", assignment });
  } catch (err) {
    logger.error("Error submitting assignment: " + err.message);
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.editAssignmentDueDate = async (req, res) => {
  logger.info("editAssignmentDueDate Endpoint called");
  try {
    const assignment = await assignmentService.editAssignmentDueDate(
      req.user,
      req.params.assignmentId,
      req.body.newDueDate
    );
    res.status(200).json({
      msg: "Assignment due date updated successfully",
      assignment,
    });
  } catch (err) {
    logger.error(`Error updating due date: ${err.message}`);
    res.status(err.status || 500).json({ message: err.message });
  }
};

// Not exposed via HTTP - cron or scheduler uses this
exports.sendAssignmentReminders = async (req, res) => {
  logger.info("sendAssignmentReminders Endpoint called");
  try {
    await assignmentService.sendAssignmentReminders({ excludeExpired: true });
    res.json({ message: "Reminders sent successfully" });
  } catch (err) {
    logger.error("Error sending reminders: " + err.message);
    res.status(500).json({ message: "Failed to send reminders" });
  }
};
