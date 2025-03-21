const express = require("express");
//const { authMiddleware } = require("../auth/authMiddleware");
const { createAssignment, getAssignments, submitAssignment } = require("../controllers/assignmentController");

const assignmentRouter = express.Router();

assignmentRouter.post("/", createAssignment);
assignmentRouter.get("/", getAssignments);
assignmentRouter.post("/:assignmentId/submit", submitAssignment);

module.exports = assignmentRouter;
