const express = require("express")
const {assignRole, deleteUser, deleteTeacher, getAllUsers} = require("./../controllers/adminController")
const {verifyAdmin, validateMongoId} = require("./../auth/verifyAdminMiddleware")

const adminRouter = express.Router();
adminRouter.patch("/admin/assign-role", validateMongoId, assignRole);
adminRouter.delete("/admin/delete-user/:id", validateMongoId, deleteUser);
adminRouter.delete("/admin/delete-teacher/:id", validateMongoId, deleteTeacher);
adminRouter.get("/admin/get-users", verifyAdmin, getAllUsers);


module.exports = adminRouter