const express = require('express');
const {verifyUser} = require('../auth/verifyAdminMiddleware');
const { createCourse, getCourses, enrollStudent } = require("../controllers/courseController");

const courseRouter = express.Router();

courseRouter.post("/", verifyUser,  createCourse);
courseRouter.get("/", verifyUser, getCourses);
courseRouter.post("/:courseId/enroll", enrollStudent);

module.exports = courseRouter;