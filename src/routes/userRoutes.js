const express = require('express')
const { validateSignup } = require('../utils/validator')
const {getEnrolledCourses, signUp, verifyAccount, resendVerificationCode, signIn, forgotPassword, resetPassword } = require ('../controllers/userController')
const userRouter = express.Router()
const {  updateUser } = require("../controllers/userController");
const { verifyToken } = require("../auth/verifyAdminMiddleware"); 

userRouter.post('/user/signup', validateSignup, signUp)
userRouter.post('/user/verify-account', verifyAccount)
userRouter.post('/user/resend-verification-code', resendVerificationCode)
userRouter.put('/user/update/:id', verifyToken,  updateUser);
userRouter.post('/user/signIn', signIn)
userRouter.post('/user/forgot-password', forgotPassword)
userRouter.post('/user/reset-password/:token', resetPassword)
userRouter.get('/user/enrolled-courses', verifyToken, getEnrolledCourses)


module.exports = userRouter

