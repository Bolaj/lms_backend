const express = require("express");
const { verifyUser, verifyToken } = require("../auth/verifyAdminMiddleware");
const { createAssignment, getAssignments, submitAssignment } = require("../controllers/assignmentController");

const assignmentRouter = express.Router();


assignmentRouter.post("/", verifyUser, createAssignment);
assignmentRouter.get("/", getAssignments);
assignmentRouter.post("/:assignmentId/submit", verifyToken, submitAssignment);

module.exports = assignmentRouter;
