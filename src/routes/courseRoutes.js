const express = require('express');
const {authMiddleware} = require('../auth/authMiddleware');
const { createCourse, getCourses, enrollStudent } = require("../controllers/courseController");

const courseRouter = express.Router();

courseRouter.post("/", authMiddleware, createCourse);
courseRouter.get("/", authMiddleware, getCourses);
courseRouter.post("/:courseId/enroll", authMiddleware, enrollStudent);

module.exports = courseRouter;
