const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();
const { Op } = require('sequelize');
const { sendEmail } = require('../services/mailService');
require('dotenv').config();






const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Authentification échouée', loginAttempts: 0 });
      }
  
      // Vérifier si le compte est verrouillé
      if (user.lockUntil && user.lockUntil > new Date()) {
        return res.status(401).json({ message: 'Compte temporairement verrouillé. Réessayez plus tard.', loginAttempts: user.loginAttempts });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        if (user.loginAttempts >= 3) {
          user.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
          user.loginAttempts = 0;
          await user.save();
  
          await sendEmail(user.email, "Sécurité du Compte", "Votre compte a été verrouillé après 3 tentatives de connexion infructueuses.");
          return res.status(401).json({ message: 'Compte temporairement verrouillé. Réessayez plus tard.', loginAttempts: user.loginAttempts });
        }
        await user.save();
        return res.status(401).json({ message: 'Authentification échouée', loginAttempts: user.loginAttempts });
      }
  
      // Réinitialiser les tentatives de connexion en cas de réussite
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();
  
      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      res.json({ message: 'Connexion réussie', token, userId: user.id, loginAttempts: user.loginAttempts });
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ message: 'Erreur lors de la connexion de l’utilisateur.' });
    }
  });
  

router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email } });
  
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }
  
      const token = crypto.randomBytes(20).toString('hex');
      const expires = Date.now() + 3600000; // 1 heure
  
      user.resetPasswordToken = token;
      user.resetPasswordExpires = expires;
      await user.save();
  
      const resetLink = `${process.env.FRONT_END_URL}/reset-password?token=${token}`;
  
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: user.email,
        subject: 'Réinitialisation du mot de passe',
        text: `Vous avez demandé une réinitialisation de mot de passe. Cliquez sur le lien suivant pour le réinitialiser : ${resetLink}`
      });
  
      res.status(200).json({ message: 'Un e-mail de réinitialisation a été envoyé.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la demande de réinitialisation.' });
    }
  });
  

  router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token invalide ou expiré.' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
        res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe.' });
    }
});

if (!process.env.SMTP_HOST || !process.env.JWT_SECRET) {
  console.error("Missing required environment variables");
  process.exit(1);
}

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du token de vérification
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Création de l'utilisateur dans la base de données
    const newUser = await User.create({
      email,
      password: hashedPassword,
      verificationToken,
      passwordLastChanged: new Date()
    });

    // Préparation de l'email de bienvenue
    const emailContent = `
      <div>
        <h1>Bienvenue sur Troupicool, ${email} !</h1>
        <p>Nous sommes ravis de vous compter parmi nous.</p>
        <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre compte :</p>
        <a href="${process.env.FRONT_END_URL}/verify-account?token=${verificationToken}">Vérifier mon compte</a>
        <p>Si vous n'avez pas créé de compte sur notre site, veuillez ignorer cet e-mail.</p>
      </div>
    `;

    // Envoi de l'email de bienvenue
    try {
      await sendEmail(email, 'Bienvenue sur Troupicool!', emailContent);
      res.status(201).json({ message: "Utilisateur enregistré avec succès et e-mail envoyé !", user: newUser });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
      res.status(500).json({
        message: "Utilisateur créé, mais l'envoi de l'email a échoué.",
        emailError: error.message,
        userId: newUser.id,
        token: verificationToken
      });
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l’utilisateur', error: error.message });
  }
});

router.get('/verify/:token', async (req, res) => {
  try {
      const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
      const user = await User.findOne({ where: { verificationToken: req.params.token } });

      if (!user) {
          return res.status(404).json({ message: 'Utilisateur non trouvé ou token invalide.' });
      }

      user.isVerified = true;
      user.verificationToken = null;
      await user.save();

      res.status(200).json({ message: 'Compte vérifié avec succès!' });
  } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
          return res.status(401).json({ message: 'Token de vérification invalide.' });
      }
      console.error('Error during account verification:', error);
      res.status(500).json({ message: 'Erreur lors de la vérification du compte.' });
  }
});



router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send({ message: 'Erreur lors de la déconnexion' });
    }
    res.clearCookie('connect.sid'); // Assurez-vous que le nom du cookie est correct
    res.status(200).send({ message: 'Déconnexion réussie' });
  });
});
module.exports = router;
      