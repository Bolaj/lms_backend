const express = require("express");
const { authMiddleware } = require("../auth/authMiddleware");
const { createAssignment, getAssignments, submitAssignment } = require("../controllers/assignmentController");

const assignmentRouter = express.Router();

assignmentRouter.post("/", authMiddleware, createAssignment);
assignmentRouter.get("/", authMiddleware, getAssignments);
assignmentRouter.post("/:assignmentId/submit", authMiddleware, submitAssignment);

module.exports = assignmentRouter;
