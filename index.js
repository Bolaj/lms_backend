const express = require('express');
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocs = YAML.load('./src/swagger/swagger.yml')
const cors = require('cors')

const app = express()
const db = require('./src/config/db');
db()

app.use(express.json())
app.use(cors());

const corsOptions = {
  origin: 'https://lms-backend-vb2k.onrender.com', 
};
app.use(cors(corsOptions));

const dotenv = require('dotenv')
dotenv.config()

const appRouter = require('./src/app');
app.use("/api", appRouter)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));



const port = process.env.PORT
app.listen(port, () => {
  console.log("App listening on port", port);
  console.log("Swagger UI available at http://localhost:4000/api-docs");
});
app.get('/', (req, res) => {
  return res.status(200).json({
    message: "Welcome to the School Learning Management System (LMS) is a platform designed to help schools efficiently manage students, teachers, courses, assignments, and communication in an online environment. The system provides role-based access control (RBAC) for administrators, teachers, and students."
  })
})
