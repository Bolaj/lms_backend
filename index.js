const express = require('express');
const app = express()
const db = require('./src/config/db');
db()

app.use(express.json())

const dotenv = require('dotenv')
dotenv.config()

const appRouter = require('./src/app');
app.use("/api", appRouter)



const port = process.env.PORT

app.listen(port, () => console.log("App listening on port", port))

app.get('/', (req, res) => {
  return res.status(200).json({
    message: "Welcome to the School Learning Management System (LMS) is a platform designed to help schools efficiently manage students, teachers, courses, assignments, and communication in an online environment. The system provides role-based access control (RBAC) for administrators, teachers, and students."
  })
})
