const express = require('express');

const app = express()
const db = require('./src/config/db');
db()

app.use(express.json())

const dotenv = require('dotenv')
dotenv.config()

const appRouter = require('./src/app');
const courseRouter = require('./src/routes/courseRoutes');
const { assign } = require('nodemailer/lib/shared');
const assignmentRouter = require('./src/routes/assignmentRoutes');
app.use("/api", appRouter)
app.use("/api/courses", courseRouter);
app.use("/api/assignments", assignmentRouter);


const port = process.env.PORT

app.listen(port, () => console.log("App listening on port", port))