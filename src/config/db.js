const mongoose = require('mongoose')

const dotenv = require ('dotenv')
dotenv.config()

const db = async () => {
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log('Database Connected..')
    } catch (err) {
        console.log(err)
    }
}

module.exports = db