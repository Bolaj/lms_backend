const express = require('express')
const { validateSignup } = require('../utils/validator')
const {getUsers, signUp, verifyAccount,resendVerificationCode } = require ('../controllers/userController')
const userRouter = express.Router()

userRouter.get('/users', getUsers)
userRouter.post('/user/signup', validateSignup, signUp)
userRouter.post('/user/verify-account', verifyAccount)
userRouter.post('/user/resend-verification-code', resendVerificationCode)


module.exports = userRouter
