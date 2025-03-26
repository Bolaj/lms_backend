const express = require("express");
const { requestEnrollment, approveEnrollment, getPendingEnrollments, getEnrollmentHistory, removeStudent } = require("../controllers/enrollmentController");
const authMiddleware = require("../auth/authMiddleware");
const { appRouter } = require("../app");

const enrollmentRouter = express.Router();

enrollmentRouter.post("/request", authMiddleware, requestEnrollment);
enrollmentRouter.post("/approve", authMiddleware, approveEnrollment);
enrollmentRouter.get("/pending", authMiddleware, getPendingEnrollments);
enrollmentRouter.get("/history", authMiddleware, getEnrollmentHistory);
enrollmentRouter.delete("/remove", authMiddleware, removeStudent);
module.exports = enrollmentRouter;