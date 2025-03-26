const express = require('express')
const userRouter = require('./routes/userRoutes')
const adminRouter = require("./routes/adminRoutes")
const courseRouter = require('./routes/courseRoutes')
const assignmentRouter = require('./routes/assignmentRoutes')
const enrollmentRouter = require('./routes/enrollmentRoutes')
const authMiddleware = require('./auth/authMiddleware')


const appRouter = express()

appRouter.use('/user', userRouter)
appRouter.use('/course', courseRouter)
appRouter.use('/assignment', assignmentRouter)
appRouter.use('/enrollment', enrollmentRouter)
appRouter.use('/lms/dev', (req, res) =>{
    res.send('Development API')
})

appRouter.use("/lms", adminRouter)


module.exports = appRouter

