const express = require('express')
const userRouter = require('./routes/userRoutes')
const appRouter = express()

appRouter.use('/lms', userRouter)

module.exports = appRouter