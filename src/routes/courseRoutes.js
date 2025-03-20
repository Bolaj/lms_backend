const express = require("express");
const { body } = require("express-validator");
const { createCourse, updateCourse, deleteCourse,  getAllCourses, getCourseById  } = require("../controllers/courseController");
const authMiddleware = require("../auth/authMiddleware");

const router = express.Router();

router.post(
  "/create",
  authMiddleware,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("category").notEmpty().withMessage("Category is required"),
  ],
  createCourse
);

router.put(
  "/update/:courseId",
  authMiddleware,
  [
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().notEmpty().withMessage("Description cannot be empty"),
  ],
  updateCourse
);

router.delete("/delete/:courseId", authMiddleware, deleteCourse);
router.get("/all", authMiddleware, getAllCourses);
router.get("/:courseId", authMiddleware, getCourseById);


module.exports = router;
