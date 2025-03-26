const User = require("./../models/user");

exports.assignRole = async (req, res) => {
    try {
        const { id, role } = req.body;

        if (!["student", "teacher", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findByIdAndUpdate(id, { role }, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Role updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

//----> Remember to add soft delete
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "student") {
            return res.status(403).json({ message: "Only students can be deleted" });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

exports.deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can be deleted" });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "Teacher deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

exports.getAllUsers = async (req, res) => {
    try {
      const { search, page = 1, limit = 10 } = req.query;
  
      let query = {};
      if (search) {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(search);
  
        if (isObjectId) {
          query = { _id: search };
        } else {
          query = {
            $or: [
              { firstName: { $regex: search, $options: "i" } },
              { lastName: { $regex: search, $options: "i" } },
              { phoneNumber: { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
            ],
          };
        }
      }
  
      const users = await User.find(query, "-password")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
  
      const totalUsers = await User.countDocuments(query);
  
      res.json({
        totalUsers,
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        users,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ msg: error.message });
    }
  };