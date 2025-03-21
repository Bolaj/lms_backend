const express = require('express');
//const {authMiddleware} = require('../auth/authMiddleware');
const { createCourse, getCourses, enrollStudent } = require("../controllers/courseController");

const courseRouter = express.Router();

courseRouter.post("/", createCourse);
courseRouter.get("/", getCourses);
courseRouter.post("/:courseId/enroll", enrollStudent);

module.exports = courseRouter;