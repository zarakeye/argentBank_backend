const mongoose = require('mongoose')
const dotenv = require('dotenv')
require('dotenv').config()

const NODE_ENV = process.env.NODE_ENV || 'development'

const DATABASE_URL = NODE_ENV === 'production' ? process.env.DATABASE_URL_PROD : process.env.DATABASE_URL_DEV// || 'mongodb://localhost/argentBankDB'

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is undefined. Check your .env file and NODE_ENV setting.');
  process.exit(1);
}

module.exports = async () => {
  try {
    await mongoose.connect(DATABASE_URL, { useNewUrlParser: true })
    console.log('Database successfully connected')
  } catch (error) {
    console.error(`Database Connectivity Error: ${error}`)
    throw new Error(error)
  }
}
