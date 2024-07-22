const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    console.log('Authenticating request...');
    console.log('Request Headers:', req.headers);  // Log all headers for debugging

    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);

    if (!authHeader) {
      console.log('Authorization header missing');
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    console.log('JWT Token:', token);

    if (!token) {
      console.log('JWT Token missing');
      return res.status(401).json({ message: 'JWT Token missing' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decodedToken);

    req.userData = { 
      email: decodedToken.email, 
      userId: decodedToken.userId, 
      role: decodedToken.role, 
      isVerified: decodedToken.isVerified 
    };

    if (!req.userData.isVerified) {
      console.log('User account not verified');
      return res.status(401).json({ message: "Votre compte n'est pas vérifié." });
    }

    next();
  } catch (error) {
    console.error('Authentication failed:', error.message);
    return res.status(401).json({
      message: 'Votre session n\'est pas valide, veuillez vous reconnecter.'
    });
  }
};
