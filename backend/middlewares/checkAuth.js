const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("authHeader", authHeader)
      return res.sendStatus(404);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      console.log("token", token)
      return res.sendStatus(404);
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    req.userData = { 
      email: decodedToken.email, 
      userId: decodedToken.userId, 
      role: decodedToken.role, 
      isVerified: decodedToken.isVerified 
    };

    const user = await User.findByPk(req.userData.userId);
    if (!user) {
      console.log("user", user)
      return res.sendStatus(404);
    }

    if ((!req.userData.isVerified) || (user.is_verified !== req.userData.isVerified)) {
      console.log("user.is_verifieduser", user.is_verified);
      console.log("req.userData.isVerified", req.userData.isVerified);
      return res.sendStatus(404);
    }
    
    if ((!req.userData.role) || (user.role !== req.userData.role)) {
      console.log("user.role", user.role);
      console.log("req.userData.role", req.userData.role);
      return res.sendStatus(404);
    }

    next();
  } catch (error) {
    console.error("error", error);
    return res.sendStatus(404);
  }
};
