const jwt = require('jsonwebtoken')
const { restart } = require('nodemon')

module.exports.validateToken = (req, res, next) => {
  try {
    const userToken = req.cookies.token

    if (!userToken) {
      return res.status(401).send({ message: 'Token cookie is missing' })
    }
    
    const decodedToken = jwt.verify(
      userToken,
      process.env.SECRET_KEY || 'default-secret-key'
    )

    req.user = decodedToken

    return next()
  } catch (error) {
    console.error('Error in tokenValidation.js', error)
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

}
