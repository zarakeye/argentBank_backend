const User = require('../database/models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

module.exports.createUser = async serviceData => {
  try {
    const user = await User.findOne({ email: serviceData.email })
    if (user) {
      throw new Error('Email already exists')
    }

    const hashPassword = await bcrypt.hash(serviceData.password, 12)

    const newUser = new User({
      email: serviceData.email,
      password: hashPassword,
      firstName: serviceData.firstName,
      lastName: serviceData.lastName
    })

    let result = await newUser.save()

    return result
  } catch (error) {
    console.error('Error in userService.js', error)
    throw new Error(error)
  }
}

module.exports.getUserProfile = async req => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      throw new Error('Authorization header is missing!')
    }

    const parts = authHeader.split('Bearer ')

    if (parts.length < 2) {
      throw new Error('Token is malformed or missing!')
    }

    const userToken = parts[1].trim()
    const decodedJwtToken = jwt.verify(
      userToken,
      process.env.SECRET_KEY || 'default-secret-key'
    )

    if (!decodedJwtToken.id) {
      throw new Error('Token payload missing user ID!')
    }

    const userId = new Mongoose.Types.ObjectId(decodedJwtToken.id)
    const user = await User.findOne({ _id: userId })

    if (!user) {
      throw new Error('User not found!')
    }

    return user.toObject()
  } catch (error) {
    console.error('Error in userService.js', error)
    throw new Error(error.message || 'Error retrieving user profile')
  }
}

module.exports.loginUser = async serviceData => {
  try {
    const user = await User.findOne({ email: serviceData.email })

    if (!user) {
      throw new Error('User not found!')
    }

    const isValid = await bcrypt.compare(serviceData.password, user.password)

    if (!isValid) {
      throw new Error('Password is invalid')
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.SECRET_KEY || 'default-secret-key',
      { expiresIn: '1d' }
    )

    return { token }
  } catch (error) {
    console.error('Error in userService.js', error)
    throw new Error(error)
  }
}

module.exports.updateUserProfile = async req => {
  try {
    const userId = req.user.id; // injecté par validateToken

    const user = await User.findOneAndUpdate(
      { _id: userId },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName
      },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found!');
    }

    return user.toObject();
  } catch (error) {
    console.error('Error in userService.js', error);
    throw new Error(error.message || 'Error updating user profile');
  }
};


// module.exports.updateUserProfile = async serviceData => {
//   try {
//     const jwtToken = serviceData.headers.authorization.split('Bearer')[1].trim()
//     const decodedJwtToken = jwt.decode(jwtToken)
//     const user = await User.findOneAndUpdate(
//       { _id: decodedJwtToken.id },
//       {
//         firstName: serviceData.body.firstName,
//         lastName: serviceData.body.lastName
//       },
//       { new: true }
//     )

//     if (!user) {
//       throw new Error('User not found!')
//     }

//     return user.toObject()
//   } catch (error) {
//     console.error('Error in userService.js', error)
//     throw new Error(error)
//   }
// }
