// Supposons que vous utilisez routes/security.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

router.post('/register', async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 8);

    // Générez un token de vérification unique - par exemple, un JWT ou un UUID
    const verificationToken = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Insérez l'utilisateur dans la base de données avec le token
    const user = await User.create({
      email: email,
      password: hashedPassword,
      verification_Token: verificationToken, // Assurez-vous que votre modèle User a cette colonne
      // autres champs si nécessaire
    });

    // Ici, vous intégreriez le processus d'envoi de l'e-mail

    res.status(201).json({ message: 'Utilisateur créé', userId: user.id, token: verificationToken });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: "L'email est déjà utilisé." });
    }
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l’utilisateur.' });
  }
});

module.exports = router;
