const express = require('express')
const userRouter = require('./routes/userRoutes')
const courseRouter = require('./routes/courseRoutes')
const appRouter = express()

appRouter.use('/lms', userRouter)
appRouter.use("/lms/courses", courseRouter);
appRouter.use('/lms/dev', (req, res) =>{
    res.send('Development API')
})

module.exports = appRouter