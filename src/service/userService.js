const User = require("../models/user");
const Course = require("../models/Course");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/emailService");
const logger = require("../utils/logger");
const generateVerificationCode = () =>
  crypto.randomInt(100000, 999999).toString();
const { validationResult } = require("express-validator");

exports.getEnrolledCourses = async (userId) => {
  logger.info(`Fetching enrolled courses for user ID: ${userId}`);

  const courses = await Course.find({ students: userId });

  if (!courses || courses.length === 0) {
    logger.warn(`No enrolled courses found for user ID: ${userId}`);
    throw {
      status: 404,
      message: "No enrolled courses found",
    };
  }

  logger.info(`Enrolled courses fetched successfully for user ID: ${userId}`);

  return {
    message: "Enrolled courses fetched successfully",
    courses,
  };
};
exports.signIn = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Incorrect login details");

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { user, token };
};

exports.signUp = async (data) => {
  const { firstName, lastName, email, password, phoneNumber, role } = data;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationCode = generateVerificationCode();
  const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phoneNumber,
    role,
    verificationCode,
    verificationCodeExpires,
  });

  await newUser.save();

  await sendEmail(
    email,
    "Account Verification Code",
    `Your verification code is: ${verificationCode}. It expires in 10 minutes.`
  );

  return newUser;
};
exports.verifyAccount = async ({ email, code }) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("User not found");

  if (
    user.verificationCode !== code ||
    user.verificationCodeExpires < new Date()
  ) {
    throw new Error("Invalid or expired verification code");
  }

  user.isVerified = true;
  user.verificationCode = null;
  user.verificationCodeExpires = null;
  await user.save();

  return { message: "Account verified successfully" };
};

exports.resendVerificationCode = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  if (user.isVerified) {
    const error = new Error("Account is already verified");
    error.status = 400;
    throw error;
  }

  const newVerificationCode = generateVerificationCode();
  user.verificationCode = newVerificationCode;
  user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
  await user.save();

  await sendEmail(
    email,
    "New Verification Code",
    `Your new verification code is: ${newVerificationCode}. It expires in 10 minutes.`
  );

  return { message: "New verification code sent." };
};

exports.getUserProfile = async (id) => {
  const user = await User.findById(id).select("-password");
  if (!user) throw new Error("User not found");

  return user;
};

exports.updateUserProfile = async (id, data) => {
  const user = await User.findByIdAndUpdate(id, data, { new: true }).select("-password");
  if (!user) throw new Error("User not found");

  return user;
};


exports.deleteUserByRole = async (id, expectedRole) => {
  const user = await User.findById(id);
  if (!user) throw new Error("User not found");

  if (user.role !== expectedRole) throw new Error(`Only ${expectedRole}s can be deleted`);

  await User.findByIdAndDelete(id);
  return { message: `${expectedRole[0].toUpperCase() + expectedRole.slice(1)} deleted successfully` };
};

exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User with this email does not exist");

  const resetToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "10minutes" } 
  );

const resetLink = `${process.env.BACKEND_URL}/api/lms/user/reset-password?token=${resetToken}`;

  await sendEmail(
    email,
    "Password Reset Request",
    `Click the following link to reset your password: ${resetLink}\n\nThis link will expire in 15 minutes.`
  );

  return { message: "Password reset link has been sent to your email" };
};

exports.resetPassword = async (token, newPassword) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) throw new Error("Invalid token or user does not exist");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return { message: "Password reset successful" };
  } catch (err) {
    throw new Error("Invalid or expired reset token");
  }
};
