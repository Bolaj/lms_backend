const express = require('express')
const userRouter = require('./routes/userRoutes')
const appRouter = express()

appRouter.use('/lms', userRouter)
appRouter.use('/lms/dev', (req, res) =>{
    res.send('Development API')
})

module.exports = appRouter