const User = require("../models/user");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/emailService");
const generateVerificationCode = () =>
  crypto.randomInt(100000, 999999).toString();
const { validationResult } = require("express-validator");

exports.signUp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { firstName, lastName, email, password, phoneNumber, role } =
      req.body;
    const existingUser = await User.findOne({ email: email });
    if (existingUser)
      return res.status(400).json({ msg: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = await new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      verificationCode,
      verificationCodeExpires,
    }).save();
    await sendEmail(
      email,
      "Account Verification Code",
      `Your verification code is: ${verificationCode}. It expires in 10 minutes.`
    );
    return res.status(201).json({
      message:
        "Signed Up Successfully. Check your email for the verification code.",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      msg: error.message,
    });
  }
};
exports.verifyAccount = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Account is already verified" });

    if (!user.verificationCode || user.verificationCodeExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "Verification code expired. Request a new one." });
    }

    if (user.verificationCode !== verificationCode) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return res
      .status(200)
      .json({ message: "Account verified successfully", token });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Account is already verified" });

    const newVerificationCode = generateVerificationCode();
    user.verificationCode = newVerificationCode;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(
      email,
      "New Verification Code",
      `Your new verification code is: ${newVerificationCode}. It expires in 10 minutes.`
    );

    return res.status(200).json({ message: "New verification code sent." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
