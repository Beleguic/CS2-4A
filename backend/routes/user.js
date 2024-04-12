const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/user');
const checkAuth = require('../middlewares/checkAuth');
const mailService = require('../services/mailService');

// Route d'inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, emailContent } = req.body;  // Récupération du contenu HTML de l'email depuis le frontend
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const newUser = await User.create({
      email,
      password: hashedPassword,
      verificationToken,
    });

    try {
      await req.transporter.sendMail({
        from: 'Troupicool <team.troupicool@outlook.com>',
        to: email,
        subject: 'Bienvenue sur Troupivcool!',
        html: emailContent  // Utilisation du HTML fourni par le frontend
      });
      console.log('Email de bienvenue envoyé');
      res.status(201).json({ message: "Utilisateur enregistré avec succès et e-mail envoyé !", user: newUser });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
      res.status(500).json({ message: "Erreur lors de l'envoi de l'e-mail de bienvenue." });
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'utilisateur', error);
    res.status(500).json({ message: "Erreur lors de l\'ajout de l\'utilisateur" });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(401).json({ message: 'Authentification échouée' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Authentification échouée' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Connexion réussie',
      token: token,
      userId: user.id
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion de l’utilisateur.' });
  }
});

router.get('/:userId', checkAuth, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.status(200).json({ email: user.email, id: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
  }
});

// Route pour la vérification du token d'un utilisateur
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

module.exports = router;
