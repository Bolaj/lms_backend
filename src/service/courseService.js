const Course = require("../models/Course");
const logger = require("../utils/logger");

exports.createCourse = async ({ body, file, user }) => {
  const { courseCode, title, description, teacherId } = body;

  logger.info("Creating course...");

  if (user.role !== "teacher" && user.role !== "admin") {
    logger.warn(`Unauthorized access attempt by user ${user.id} with role ${user.role}`);
    throw {
      status: 403,
      message: "Access denied! Only Teachers and Admins are authorized to create Courses",
    };
  }

  if (user.role === "admin" && !teacherId) {
    logger.warn(`Admin user ${user.id} attempted to create a course without providing a teacherId`);
    throw {
      status: 400,
      message: "Teacher ID is required to assign a teacher to the course",
    };
  }

  const existingCourse = await Course.findOne({ courseCode });
  if (existingCourse) {
    logger.warn(`Course with code '${courseCode}' already exists`);
    throw {
      status: 400,
      message: `A course with the code '${courseCode}' already exists.`,
    };
  }

  let fileUrl = null;
  if (file) {
    fileUrl = file.path;
    logger.info(`File uploaded successfully: ${fileUrl}`);
  }

  const course = new Course({
    courseCode,
    title,
    description,
    teacher: user.role === "teacher" ? user.id : teacherId,
    fileUrl,
  });

  await course.save();

  logger.info(`Course '${courseCode}' created by user ${user.id}`);

  return {
    message: "Course created successfully",
    course,
  };
};

exports.getCourses = async () => {
  logger.info("getCourses service called");
  return await Course.find().populate("teacher", "name email");
};


exports.enrollStudent = async (user, courseCode) => {
  logger.info("enrollStudent service called");

  if (user.role !== "student") {
    logger.warn(`Unauthorized access by ${user.id} with role ${user.role}`);
    throw { status: 401, message: "Only students can enroll" };
  }

  const course = await Course.findOne({ courseCode });
  if (!course) {
    logger.warn(`Course not found for code: ${courseCode}`);
    throw { status: 404, message: "Course not found" };
  }

  if (course.students.includes(user.id)) {
    logger.warn(`Student ${user.id} already enrolled in course '${courseCode}'`);
    throw { status: 400, message: "Already enrolled" };
  }

  course.students.push(user.id);
  await course.save();

  logger.info(`Student ${user.id} enrolled in course '${courseCode}'`);
  return course;
};

exports.updateCourse = async (user, courseCodeParam, body) => {
  logger.info("updateCourse service called");

  const course = await Course.findOne({ courseCode: courseCodeParam });
  if (!course) {
    logger.warn(`Course with code '${courseCodeParam}' not found`);
    throw { status: 404, message: "Course not found" };
  }

  if (user.role !== "teacher" && user.role !== "admin") {
    logger.warn(`Unauthorized update attempt by ${user.id}`);
    throw { status: 403, message: "Only Teachers and Admins can update courses" };
  }

  if (user.role === "teacher" && course.teacher.toString() !== user.id) {
    logger.warn(`Teacher ${user.id} tried updating a course they don't own`);
    throw { status: 403, message: "You are not authorized to update this course" };
  }

  const { courseCode, title, description } = body;
  course.courseCode = courseCode || course.courseCode;
  course.title = title || course.title;
  course.description = description || course.description;

  await course.save();
  logger.info(`Course updated successfully: ${courseCodeParam} by ${user.id}`);
  return course;
};

exports.softDeleteCourse = async (user, courseCodeParam) => {
  logger.info("softDeleteCourse service called");

  const course = await Course.findOne({ courseCode: courseCodeParam });
  if (!course) {
    logger.warn(`Soft delete failed: Course with code '${courseCodeParam}' not found`);
    throw { status: 404, message: "Course not found" };
  }

  if (user.role !== "admin") {
    logger.warn(`Unauthorized soft delete by ${user.id}`);
    throw { status: 403, message: "Only admins can delete courses" };
  }

  course.deleted = true;
  await course.save();
  logger.info(`Course soft-deleted: ${courseCodeParam} by ${user.id}`);
  return course;
};

exports.deleteCoursePermanently = async (user, courseCodeParam) => {
  logger.info("deleteCoursePermanently service called");

  const course = await Course.findOne({ courseCode: courseCodeParam });
  if (!course) {
    logger.warn(`Permanent delete failed: '${courseCodeParam}' not found`);
    throw { status: 404, message: "Course not found" };
  }

  if (user.role !== "admin") {
    logger.warn(`Unauthorized permanent delete by ${user.id}`);
    throw { status: 403, message: "Only admins can delete permanently" };
  }

  await Course.deleteOne({ courseCode: courseCodeParam });
  logger.info(`Course permanently deleted: ${courseCodeParam} by ${user.id}`);
};

exports.restoreCourse = async (user, courseCodeParam) => {
  logger.info("restoreCourse service called");

  const course = await Course.findOne({ courseCode: courseCodeParam });
  if (!course) {
    logger.warn(`Restore failed: '${courseCodeParam}' not found`);
    throw { status: 404, message: "Course not found" };
  }

  if (user.role !== "admin") {
    logger.warn(`Unauthorized restore by ${user.id}`);
    throw { status: 403, message: "Only admins can restore courses" };
  }

  course.deleted = false;
  await course.save();
  logger.info(`Course restored: ${courseCodeParam} by ${user.id}`);
  return course;
};