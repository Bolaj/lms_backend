const express = require('express');
const app = express()
const db = require('./src/config/db');
db()

app.use(express.json())

const dotenv = require('dotenv')
dotenv.config()

const appRouter = require('./src/app')
app.use("/api", appRouter)


const port = process.env.PORT

app.listen(port, () => console.log("App listening on port", port))
