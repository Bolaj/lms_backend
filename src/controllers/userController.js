
const userService = require('../service/userService');

exports.signUp = async (req, res) => {
  try {
    const result = await userService.signUp(req.body);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

exports.signIn = async (req, res) => {
  try {
    const result = await userService.signIn(req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

exports.signOut = async (req, res) => {
  try {
    const result = await userService.signOut(req.headers.authorization);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

exports.verifyAccount = async (req, res) => {
  try {
    const result = await userService.verifyAccount(req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

exports.resendVerificationCode = async (req, res) => {
  try {
    const result = await userService.resendVerificationCode(req.body.email);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const result = await userService.getEnrolledCourses(req.user.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const result = await userService.getUserProfile(req.user.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const result = await userService.updateUser(req.params.id, req.body, req.user.role);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const result = await userService.forgotPassword(req.body.email, req);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const result = await userService.resetPassword(req.params.token, req.body.newPassword, req.body.confirmPassword);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
};
