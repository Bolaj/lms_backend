const express = require('express')
const userRouter = require('./routes/userRoutes')
const courseRouter = require('./routes/courseRoutes')
const assignmentRouter = require('./routes/assignmentRoutes')

const appRouter = express()

appRouter.use('/user', userRouter)
appRouter.use('/course', courseRouter)
appRouter.use('/assignment', assignmentRouter)
appRouter.use('/lms/dev', (req, res) =>{
    res.send('Development API')
})

module.exports = appRouter;