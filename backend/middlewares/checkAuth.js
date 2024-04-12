const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken);
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };
    if (!req.userData.isVerified) {
      return res.status(401).json({ message: "Votre compte n'est pas vérifié." });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Votre session n\'est pas valide, veuillez vous reconnecter.'
    });
  }
};
