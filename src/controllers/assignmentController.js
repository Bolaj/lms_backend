const Assignment = require("../models/Assignment");

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
    res.status(201).json(assignment);
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