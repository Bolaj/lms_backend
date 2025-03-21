const express = require('express')
const { validateSignup } = require('../utils/validator')
const {signUp, verifyAccount, resendVerificationCode, signIn } = require ('../controllers/userController')
const userRouter = express.Router()

userRouter.post('/user/signup', validateSignup, signUp)
userRouter.post('/user/verify-account', verifyAccount)
userRouter.post('/user/resend-verification-code', resendVerificationCode)

userRouter.post('/user/signIn', signIn)

module.exports = userRouter
