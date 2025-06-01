const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const {validateToken} = require('../middleware/tokenValidation')

router.post('/signup', userController.createUser)
router.post('/login', userController.loginUser)
router.post('/logout', validateToken, userController.logoutUser)
router.get('/profile', validateToken, userController.getUserProfile)
router.put('/profile', validateToken, userController.updateUserProfile)

module.exports = router
