const express = require('express');
const courseRouter = require('./src/routes/courseRoutes');
const assignmentRouter = require('./src/routes/assignmentRoutes');

const app = express()
const db = require('./src/config/db');
db()

app.use(express.json())

const dotenv = require('dotenv')
dotenv.config()

const appRouter = require('./src/app');
//const { assign } = require('nodemailer/lib/shared');
app.use("/api", appRouter)
app.use("/api/courses", courseRouter);
app.use("/api/assignments", assignmentRouter);


const port = process.env.PORT

app.listen(port, () => console.log("App listening on port", port))