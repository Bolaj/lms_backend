const User = require("./../models/user");


exports.assignRole = async ({ id, role }) => {
  if (!["student", "teacher", "admin"].includes(role)) {
    throw new Error("Invalid role");
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

exports.getAllUsers = async ({ search, page = 1, limit = 10 }) => {
  const query = {};

  if (search) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);

    if (isObjectId) {
      query._id = search;
    } else {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
  }

  const skip = (page - 1) * limit;

  const [users, totalUsers] = await Promise.all([
    User.find(query, "-password").skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);

  return {
    totalUsers,
    currentPage: parseInt(page),
    totalPages: Math.ceil(totalUsers / limit),
    users,
  };
};

exports.delete = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "student") {
    const error = new Error("Only students can be deleted");
    error.statusCode = 403;
    throw error;
  }

  await User.findByIdAndDelete(id);
  return { message: "Student deleted successfully" };
};

exports.deleteTeacherUser = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role !== "teacher") {
    const error = new Error("Only teachers can be deleted");
    error.statusCode = 403;
    throw error;
  }

  await User.findByIdAndDelete(id);
  return { message: "Teacher deleted successfully" };
};