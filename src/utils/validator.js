const { check } = require("express-validator");

exports.validateSignup = [
  check("firstName", "First name is required").not().isEmpty(),
  check("lastName", "Last name is required").not().isEmpty(),
  check("email", "Valid email is required").isEmail(),
  check("password", "Password must be at least 6 characters long").isLength({ min: 6 }),
  check("phone", "Invalid phone number").optional().isNumeric().isLength({ min: 10, max: 15 }),
  check("role", "Invalid role").optional().isIn(["student", "teacher", "admin"]),
];