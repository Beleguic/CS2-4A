const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Logs de debug uniquement en développement
    if (process.env.NODE_ENV === 'development') {
      console.log('Authenticating request...');
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Authorization header missing');
      }
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      if (process.env.NODE_ENV === 'development') {
        console.log('JWT Token missing');
      }
      return res.status(401).json({ message: 'JWT Token missing' });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Token decoded successfully for user:', decodedToken.email);
    }

    req.userData = { 
      email: decodedToken.email, 
      userId: decodedToken.userId, 
      role: decodedToken.role, 
      isVerified: decodedToken.isVerified 
    };

    if (!req.userData.isVerified) {
      if (process.env.NODE_ENV === 'development') {
        console.log('User account not verified');
      }
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
