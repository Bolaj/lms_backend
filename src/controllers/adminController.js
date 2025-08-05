const adminService = require("./../service/adminService");


exports.assignRole = async (req, res) => {
  try {
    const user = await adminService.assignRole(req.body);
    res.status(200).json({ message: "Role updated successfully", user });
  } catch (error) {
    const status = error.statusCode || 400;
    res.status(status).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const usersData = await adminService.getAllUsers(req.query || {});
    res.status(200).json(usersData);
  } catch (error) {
    console.error("Get all users error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.deleteUser(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.delete(id, "student");
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.deleteTeacher(id, "teacher");
    res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    res.status(403).json({ message: error.message });
  }
};



