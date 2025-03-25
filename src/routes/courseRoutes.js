const express = require('express');
const {verifyUser, verifyToken} = require('../auth/verifyAdminMiddleware');
const { createCourse, getCourses, enrollStudent, updateCourse, softDeleteCourse, deleteCoursePermanently, restoreCourse } = require("../controllers/courseController");

const courseRouter = express.Router();

courseRouter.post("/", verifyUser,  createCourse);
courseRouter.get("/", verifyUser, getCourses);
courseRouter.post("/:courseCode/enroll", verifyToken, enrollStudent);
courseRouter.put("/:courseCode", verifyUser, updateCourse);
courseRouter.post("/:courseCode/soft-delete", verifyUser, softDeleteCourse);
courseRouter.delete("/:courseCode/delete", verifyUser, deleteCoursePermanently);
courseRouter.post("/:courseCode/restore", verifyUser, restoreCourse);


module.exports = courseRouter;