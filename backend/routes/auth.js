const express = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const PasswordHistory = require('../models/passwordHistory');
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
        const daysSinceLastChange = (new Date() - user.passwordLastChanged) / (1000 * 60 * 60 * 24);

        // Si le mot de passe doit être changé
        if (daysSinceLastChange > 60) {
            user.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Verrouillage pour 24 heures
            console.log('Mot de passe doit être changé, envoi du mail de réinitialisation');
            await sendPasswordResetEmail(user);
            return res.status(403).json({
                message: 'Vous devez renouveler votre mot de passe. Un mail vous a été envoyé.',
                forcePasswordChange: true
            });
        }
        console.log('Compte verrouillé, tentative de connexion refusée');
        return res.status(401).json({ message: 'Compte temporairement verrouillé. Réessayez plus tard.', loginAttempts: user.loginAttempts });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
          user.loginAttempts = (user.loginAttempts || 0) + 1;
        if (user.loginAttempts >= 3) {
            user.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // Verrouillage pour 2 heures
            user.loginAttempts = 0;
            await user.save();
        
            console.log('Compte verrouillé après trop de tentatives de connexion infructueuses');
            await sendAccountLockedEmail(user);
            return res.status(401).json({
                message: 'Compte temporairement verrouillé. Réessayez plus tard.',
                loginAttempts: user.loginAttempts,
                lockUntil: user.lockUntil
            });
        }
        
          await user.save();
          console.log('Tentative de connexion échouée, nombre de tentatives:', user.loginAttempts);
          return res.status(401).json({ message: 'Authentification échouée', loginAttempts: user.loginAttempts });
      }

      // Réinitialiser les tentatives de connexion en cas de réussite
      user.loginAttempts = 0;
      user.lockUntil = null;
      await user.save();

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({ message: 'Connexion réussie', token, userId: user.id, role: user.role });
  } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      res.status(500).json({ message: 'Erreur lors de la connexion de l’utilisateur.' });
  }
});

async function sendAccountLockedEmail(user) {
    const lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // Calcul de la date de déblocage (2 heures plus tard)
    const formattedLockUntil = lockUntil.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

    const emailContent = `Votre compte a été verrouillé suite à plusieurs tentatives de connexion infructueuses. Vous pourrez réessayer de vous connecter le ${formattedLockUntil}.`;

    await sendEmail(user.email, "Sécurité du Compte", emailContent);
}


async function sendPasswordResetEmail(user) {
    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 3600000; // 1 heure

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetLink = `${process.env.FRONT_END_URL}/reset-password?token=${token}`;

    await sendEmail(user.email, 'Réinitialisation du mot de passe', `Vous devez renouveler votre mot de passe. Cliquez sur le lien suivant pour le réinitialiser : ${resetLink}`);
}

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
  
      // Vérifier l'historique des mots de passe
      const previousPasswords = await PasswordHistory.findAll({
        where: { userId: user.id }
      });
  
      const newPasswordHash = await bcrypt.hash(password, 10);
      for (let entry of previousPasswords) {
        if (await bcrypt.compare(password, entry.hashedPassword)) {
          const error = new Error('Vous ne pouvez pas réutiliser un ancien mot de passe.');
          error.code = 400;
          throw error;
        }
      }
  
      user.password = newPasswordHash;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      user.passwordLastChanged = new Date();
      user.lockUntil = null;

      await user.save();
  
      // Enregistrer le nouveau mot de passe dans l'historique
      await PasswordHistory.create({
        userId: user.id,
        hashedPassword: newPasswordHash
      });
  
      res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
        const statusCode = error.code || 500;
        res.status(statusCode).json({ message: error.message || 'Erreur lors de la réinitialisation du mot de passe.' });
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
      passwordLastChanged: new Date(),
      lockUntil: new Date('9999-12-31') // Verrouillage indéfini
    });
    await PasswordHistory.create({
        userId: newUser.id,
        hashedPassword
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
      res.status(201).json({ 
        message: "Votre compte a été créé avec succès. Veuillez vérifier votre e-mail pour activer votre compte. Tant que vous n'aurez pas confirmé, votre compte restera bloqué.", 
        user: newUser 
      });
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
      user.lockUntil = null;

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

router.get('/check-role', async (req, res) => {
  try {
      const token = req.headers['authorization'].split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId);

      if (!user) {
          return res.status(404).json({ message: 'Utilisateur non trouvé.' });
      }

      res.status(200).json({ role: user.role });
  } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
      res.status(500).json({ message: 'Erreur lors de la vérification du rôle.' });
  }
});

module.exports = router;
      