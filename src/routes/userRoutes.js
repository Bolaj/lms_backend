const express = require('express')
const { validateSignup } = require('../utils/validator')
const {signUp, verifyAccount, resendVerificationCode, signIn } = require ('../controllers/userController')
const userRouter = express.Router()
const { deleteUser, updateUser } = require("../controllers/userController");
const { authenticateUser, authorizeAdmin } = require("../auth/authMiddleware"); 

userRouter.post('/user/signup', validateSignup, signUp)
userRouter.post('/user/verify-account', verifyAccount)
userRouter.post('/user/resend-verification-code', resendVerificationCode)


module.exports = userRouter


userRouter.post('/user/signIn', signIn)

module.exports = userRouter

userRouter.put('/user/update/:id',  updateUser);
userRouter.delete('/user/delete/:id', deleteUser);
module.exports = userRouter

