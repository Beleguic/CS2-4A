const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    console.log('Authenticating request...');
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decodedToken);
    req.userData = { email: decodedToken.email, userId: decodedToken.userId, role: decodedToken.role, isVerified: decodedToken.isVerified };
    if (!req.userData.isVerified) {
      return res.status(401).json({ message: "Votre compte n'est pas vérifié." });
    }
    next();
  } catch (error) {
    console.error('Authentication failed:', error);
    return res.status(401).json({
      message: 'Votre session n\'est pas valide, veuillez vous reconnecter.'
    });
  }
};
