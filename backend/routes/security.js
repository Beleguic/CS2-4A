const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();
const { sendEmail } = require('../services/mailService');  // Importez la fonction sendEmail
require('dotenv').config();

if (!process.env.SMTP_HOST || !process.env.JWT_SECRET) {
  console.error("Missing required environment variables");
  process.exit(1); // Arrête l'application si les variables essentielles sont absentes
}

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const newUser = await User.create({
      email,
      password: hashedPassword,
      verificationToken,
    });

    // Préparez le contenu de l'email ici, en incluant le token dynamique
    const emailContent = `
      <div>
        <h1>Bienvenue sur Troupicool, ${email} !</h1>
        <p>Nous sommes ravis de vous compter parmi nous.</p>
        <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre compte :</p>
        <a href="${process.env.FRONT_END_URL}/verify-account?token=${verificationToken}">Vérifier mon compte</a>
        <p>Si vous n'avez pas créé de compte sur notre site, veuillez ignorer cet e-mail.</p>
      </div>
    `;

    try {
      await sendEmail(email, 'Bienvenue sur Troupicool!', emailContent);
      res.status(201).json({ message: "Utilisateur enregistré avec succès et e-mail envoyé !", user: newUser });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
      res.status(500).json({
        message: "Utilisateur créé, mais l'envoi de l'email a échoué.",
        emailError: error.message,
        userId: newUser.id,
        token: verificationToken // Envoyer le token pour usage ultérieur
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l’utilisateur', error: error.message });
  }
});

module.exports = router;
