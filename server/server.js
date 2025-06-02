const express = require('express')
const dotEnv = require('dotenv')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const yaml = require('yamljs')
const path = require('path')
const NODE_ENV = process.env.NODE_ENV || 'development'
const swaggerDocs = NODE_ENV === 'production' ? yaml.load(path.join(__dirname, '../swagger_prod.yaml')) : yaml.load(path.join(__dirname, '../swagger.yaml'))
const dbConnection = require('./database/connection')

const cookieParser = require('cookie-parser')

dotEnv.config()

const app = express()

// Connect to the database
dbConnection()

// Handle CORS issues
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://argent-bank-gamma.vercel.app' : 'http://localhost:5173',
  credentials: true
}))
// Request payload middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Handle custom routes
app.use('/api/v1/user', require('./routes/userRoutes'))

// API Documentation
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
}

app.get('/', (req, res, next) => {
  res.send('Hello from my Express server v2!')
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
