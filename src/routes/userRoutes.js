const express = require('express')
const { validateSignup } = require('../utils/validator')
const {signUp, verifyAccount, resendVerificationCode, signIn, enrollStudent } = require ('../controllers/userController')
const userRouter = express.Router()
const {  updateUser } = require("../controllers/userController");
const { verifyUser } = require("../auth/verifyAdminMiddleware"); 

userRouter.post('/user/signup', validateSignup, signUp)
userRouter.post('/user/verify-account', verifyAccount)
userRouter.post('/user/resend-verification-code', resendVerificationCode)
userRouter.put('/user/update/:id', verifyUser,  updateUser);
userRouter.post('/user/signIn', signIn)


module.exports = userRouter

