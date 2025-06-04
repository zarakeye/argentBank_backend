const User = require('../database/models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userService = require('../services/userService')

/**
 * Handles the user creation process by receiving a request with user data,
 * invoking the userService to create a new user, and sending an appropriate
 * response back to the client based on the success or failure of the operation.
 *
 * @param {Object} req - The request object containing the user data in the body.
 * @param {Object} res - The response object used to send back the HTTP response.
 * @returns {Object} Sends a response with status code and message indicating
 *                   the result of the user creation process.
 */
module.exports.createUser = async (req, res) => {
  let response = {}

  try {
    const responseFromService = await userService.createUser(req.body)
    response.status = 200
    response.message = 'User successfully created'
    response.body = responseFromService
  } catch (error) {
    console.error('Something went wrong in userController.js', error)
    response.status = 400
    response.message = error.message
  }

  return res.status(response.status).send(response)
}

/**
 * Handles the user login process by receiving a request with user credentials,
 * invoking the userService to authenticate the user, and sending a response
 * back to the client with a JWT token set as a cookie upon successful login.
 * In case of an error, sends a response with an appropriate status and error message.
 *
 * @param {Object} req - The request object containing user credentials in the body.
 * @param {Object} res - The response object used to send back the HTTP response.
 * @returns {Object} Sends a response with status code and message indicating
 *                   the result of the user login process.
 */
module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid user' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' })
    }

    const responseFromService = await userService.loginUser(req.body)
    const token = responseFromService.token

    const isMobile = req.headers['user-agent'].includes('Expo')
    // Exemple Node.js avec Express
    if (!isMobile) {
      // Token stored in a cookie HTTPOnly (React Native)
      res.cookie('token', token, {
        httpOnly: true,        // Protège contre XSS
        secure: process.env.NODE_ENV === 'production',          // Seulement en HTTPS
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',    // Renforce la sécurité CSRF
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 // 1h par exemple
      })
      // Token JWT sent for SecureStore (Expo)
      return res.status(200).json({ token })
    }
    
    return res.status(200).json({
      message: 'Connexion réussie',
      token: isMobile ? token : null,
      body: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName 
      },
    });
  } catch (error) {
    console.error('Error in loginUser (userController.js)', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

/**
 * Retrieves the user's profile data by invoking the userService and sends a response
 * back to the client with the profile information. If an error occurs during the process,
 * it responds with an appropriate status and error message.
 *
 * @param {Object} req - The request object containing user authentication details.
 * @param {Object} res - The response object used to send back the HTTP response.
 * @returns {Object} Sends a response with status code, message, and user profile data
 *                   indicating the result of the profile retrieval process.
 */
module.exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // injecté par tokenValidation

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ body: user });
  } catch (error) {
    console.error('Error in getUserProfile', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.logoutUser = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // ou 'lax' selon ton cas
    path: '/',
  });

  return res.status(200).json({ message: 'Logged out successfully' });
};


/**
 * Updates the user's profile data by invoking the userService and sends a response
 * back to the client with the updated profile information. If an error occurs during
 * the process, it responds with an appropriate status and error message.
 *
 * @param {Object} req - The request object containing user authentication details
 *                       and the new profile data in the body.
 * @param {Object} res - The response object used to send back the HTTP response.
 * @returns {Object} Sends a response with status code, message, and updated user
 *                   profile data indicating the result of the profile update process.
 */
module.exports.updateUserProfile = async (req, res) => {
//   try {
//     const responseFromService = await userService.updateUserProfile(req)
//     response.status = 200
//     response.message = 'Successfully updated user profile data'
//     response.body = responseFromService
//   } catch (error) {
//     console.log('Error in updateUserProfile - userController.js')
//     response.status = 400
//     response.message = error.message
//   }

//   return res.status(response.status).send(response)
// }
try {
    const userId = req.user.id; // injecté via middleware d'authentification par cookie
    const { firstName, lastName } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Successfully updated user profile data',
      body: {
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      }
    });
  } catch (error) {
    console.error('Error in updateUserProfile - userController.js', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
