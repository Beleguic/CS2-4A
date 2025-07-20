const { User, PasswordHistory } = require('../models');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { Op } = require('sequelize');
const { sendEmail } = require('../services/mailService');
require('dotenv').config();

// Schémas de validation
const loginSchema = Joi.object({
    email: Joi.string().email().required().max(255),
    password: Joi.string().required().min(1)
});

const registerSchema = Joi.object({
    email: Joi.string().email().required().max(255),
    password: Joi.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/)
        .message('Le mot de passe doit contenir au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial')
        .required(),
    lastName: Joi.string().required().min(1).max(100).pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/),
    firstName: Joi.string().required().min(1).max(100).pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/),
    username: Joi.string().required().min(3).max(50).pattern(/^[a-zA-Z0-9_-]+$/),
    dateOfBirth: Joi.date().max('now').required()
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().max(255)
});

const resetPasswordSchema = Joi.object({
    token: Joi.string().required().length(40),
    password: Joi.string()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/)
        .message('Le mot de passe doit contenir au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial')
        .required()
});

// Configuration du transporteur email sécurisé
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    },
    tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
});

// Middleware de validation
const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            error: 'Données de connexion invalides',
            details: error.details.map(detail => detail.message)
        });
    }
    next();
};

const validateRegister = (req, res, next) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            error: 'Données d\'inscription invalides',
            details: error.details.map(detail => detail.message)
        });
    }
    next();
};

const validateForgotPassword = (req, res, next) => {
    const { error } = forgotPasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            error: 'Email invalide',
            details: error.details.map(detail => detail.message)
        });
    }
    next();
};

const validateResetPassword = (req, res, next) => {
    const { error } = resetPasswordSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            error: 'Données de réinitialisation invalides',
            details: error.details.map(detail => detail.message)
        });
    }
    next();
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Sanitisation des données
    const sanitizedEmail = email.toLowerCase().trim();
    
    const user = await User.findOne({ 
        where: { email: sanitizedEmail },
        attributes: ['id', 'email', 'password', 'is_verified', 'login_attempts', 'lock_until', 'password_last_changed', 'role']
    });

    if (!user) {
      console.log('Tentative de connexion avec un email inexistant:', sanitizedEmail);
      return res.status(401).json({ 
          message: 'Email ou mot de passe incorrect',
          loginAttempts: 0 
      });
    }

    if (!user.is_verified) {
      console.log('Tentative de connexion avec un compte non vérifié:', sanitizedEmail);
      return res.status(403).json({ 
          message: "Votre compte n'est pas vérifié. Veuillez vérifier votre e-mail pour activer votre compte." 
      });
    }

    // Vérification du verrouillage temporaire
    if (user.lock_until && user.lock_until > new Date()) {
      const remainingTime = Math.ceil((user.lock_until - new Date()) / (1000 * 60));
      console.log('Tentative de connexion avec un compte verrouillé:', sanitizedEmail);
      return res.status(401).json({ 
          message: `Compte temporairement verrouillé. Réessayez dans ${remainingTime} minutes.`, 
          loginAttempts: user.login_attempts 
      });
    }

    // Vérification de l'expiration du mot de passe
    const daysSinceLastChange = (new Date() - user.password_last_changed) / (1000 * 60 * 60 * 24);
    if (daysSinceLastChange > 60) {
      user.lock_until = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await user.save();
      await sendPasswordResetEmail(user);
      console.log('Mot de passe expiré, email de réinitialisation envoyé:', sanitizedEmail);
      return res.status(403).json({
          message: 'Votre mot de passe a expiré. Un email de réinitialisation a été envoyé.',
          forcePasswordChange: true
      });
    }

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      user.login_attempts = (user.login_attempts || 0) + 1;

      if (user.login_attempts >= 3) {
        user.lock_until = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 heures
        user.login_attempts = 0;
        await user.save();
        await sendAccountLockedEmail(user);
        console.log('Compte verrouillé suite à 3 tentatives échouées:', sanitizedEmail);
        return res.status(401).json({
            message: 'Compte temporairement verrouillé suite à plusieurs tentatives échouées. Un email a été envoyé.',
            loginAttempts: user.login_attempts,
            lockUntil: user.lock_until
        });
      }

      await user.save();
      console.log('Tentative de connexion échouée:', sanitizedEmail, 'Tentatives:', user.login_attempts);
      return res.status(401).json({ 
          message: 'Email ou mot de passe incorrect', 
          loginAttempts: user.login_attempts 
      });
    }

    // Connexion réussie
    user.login_attempts = 0;
    user.lock_until = null;
    await user.save();

    const token = jwt.sign(
      { 
          userId: user.id, 
          email: user.email, 
          role: user.role, 
          isVerified: user.is_verified,
          iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      { 
          expiresIn: '1h',
          issuer: 'tropicool-api',
          audience: 'tropicool-frontend'
      }
    );

    console.log('Connexion réussie:', sanitizedEmail);
    res.json({ 
        message: 'Connexion réussie', 
        token, 
        userId: user.id, 
        role: user.role, 
        isVerified: user.is_verified,
        expiresIn: 3600 // 1 heure en secondes
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
        message: 'Une erreur est survenue lors de la connexion.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
  
const sendAccountLockedEmail = async (user) => {
    try {
        const lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
        const formattedLockUntil = lockUntil.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

        const emailContent = `
            <h2>Sécurité du Compte Tropicool</h2>
            <p>Bonjour,</p>
            <p>Votre compte a été verrouillé suite à plusieurs tentatives de connexion infructueuses.</p>
            <p>Vous pourrez réessayer de vous connecter le <strong>${formattedLockUntil}</strong>.</p>
            <p>Si vous n'êtes pas à l'origine de ces tentatives, veuillez contacter notre support.</p>
            <p>Cordialement,<br>L'équipe Tropicool</p>
        `;

        await sendEmail(user.email, "Sécurité du Compte - Compte Verrouillé", emailContent);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de verrouillage:', error);
    }
};

const sendPasswordResetEmail = async (user) => {
    try {
        const token = crypto.randomBytes(32).toString('hex'); // 64 caractères pour plus de sécurité
        const expires = Date.now() + 3600000; // 1 heure

        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8000'}/reset-password?token=${token}`;

        const emailContent = `
            <h2>Réinitialisation du Mot de Passe Tropicool</h2>
            <p>Bonjour,</p>
            <p>Vous devez renouveler votre mot de passe pour des raisons de sécurité.</p>
            <p>Cliquez sur le lien suivant pour le réinitialiser :</p>
            <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Réinitialiser le mot de passe</a></p>
            <p>Ce lien expire dans 1 heure.</p>
            <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
            <p>Cordialement,<br>L'équipe Tropicool</p>
        `;

        await sendEmail(user.email, 'Réinitialisation du mot de passe - Tropicool', emailContent);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
        throw error;
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const sanitizedEmail = email.toLowerCase().trim();
        
        const user = await User.findOne({ 
            where: { email: sanitizedEmail },
            attributes: ['id', 'email', 'is_verified']
        });

        if (!user) {
            // Ne pas révéler si l'email existe ou non
            console.log('Demande de réinitialisation pour un email inexistant:', sanitizedEmail);
            return res.status(200).json({ 
                message: 'Si cet email existe dans notre base de données, un lien de réinitialisation a été envoyé.' 
            });
        }

        if (!user.is_verified) {
            console.log('Demande de réinitialisation pour un compte non vérifié:', sanitizedEmail);
            return res.status(400).json({ 
                message: 'Ce compte n\'est pas vérifié. Veuillez d\'abord vérifier votre email.' 
            });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 3600000; // 1 heure

        user.reset_password_token = token;
        user.reset_password_expires = expires;
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:8000'}/reset-password?token=${token}`;

        const emailContent = `
            <h2>Réinitialisation du Mot de Passe Tropicool</h2>
            <p>Bonjour,</p>
            <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le lien suivant pour le réinitialiser :</p>
            <p><a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Réinitialiser le mot de passe</a></p>
            <p>Ce lien expire dans 1 heure.</p>
            <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
            <p>Cordialement,<br>L'équipe Tropicool</p>
        `;

        await sendEmail(user.email, 'Réinitialisation du mot de passe - Tropicool', emailContent);

        console.log('Email de réinitialisation envoyé:', sanitizedEmail);
        res.status(200).json({ 
            message: 'Si cet email existe dans notre base de données, un lien de réinitialisation a été envoyé.' 
        });
    } catch (error) {
        console.error('Erreur lors de la demande de réinitialisation:', error);
        res.status(500).json({ 
            message: 'Une erreur est survenue lors de la demande de réinitialisation.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        const user = await User.findOne({
            where: {
                reset_password_token: token,
                reset_password_expires: { [Op.gt]: Date.now() }
            },
            attributes: ['id', 'email', 'password', 'reset_password_token', 'reset_password_expires', 'password_last_changed']
        });

        if (!user) {
            console.log('Tentative de réinitialisation avec un token invalide ou expiré');
            return res.status(400).json({ 
                message: 'Token invalide ou expiré. Veuillez demander un nouveau lien de réinitialisation.' 
            });
        }

        // Vérification de l'historique des mots de passe
        const previousPasswords = await PasswordHistory.findAll({
            where: { user_id: user.id },
            order: [['created_at', 'DESC']],
            limit: 5 // Vérifier les 5 derniers mots de passe
        });

        for (let entry of previousPasswords) {
            if (await bcrypt.compare(password, entry.hashed_password)) {
                return res.status(400).json({ 
                    message: 'Vous ne pouvez pas réutiliser un ancien mot de passe. Veuillez choisir un nouveau mot de passe.' 
                });
            }
        }

        // Hashage du nouveau mot de passe
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Mise à jour de l'utilisateur
        user.password = hashedPassword;
        user.reset_password_token = null;
        user.reset_password_expires = null;
        user.password_last_changed = new Date();
        user.lock_until = null;
        user.login_attempts = 0;

        await user.save();

        // Ajout à l'historique des mots de passe
        await PasswordHistory.create({
            user_id: user.id,
            hashed_password: hashedPassword
        });

        console.log('Mot de passe réinitialisé avec succès:', user.email);
        res.status(200).json({ 
            message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.' 
        });
    } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
        res.status(500).json({ 
            message: 'Une erreur est survenue lors de la réinitialisation du mot de passe.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const register = async (req, res) => {
  const { email, password, lastName, firstName, username, dateOfBirth } = req.body;
  
  try {
    // Sanitisation des données
    const sanitizedData = {
        email: email.toLowerCase().trim(),
        password: password,
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        username: username.trim(),
        dateOfBirth: new Date(dateOfBirth)
    };

    // Vérification si l'email existe déjà
    const existingUser = await User.findOne({ 
        where: { email: sanitizedData.email },
        attributes: ['id']
    });

    if (existingUser) {
        return res.status(409).json({ 
            message: 'Un compte avec cet email existe déjà.' 
        });
    }

    // Vérification si le nom d'utilisateur existe déjà
    const existingUsername = await User.findOne({ 
        where: { username: sanitizedData.username },
        attributes: ['id']
    });

    if (existingUsername) {
        return res.status(409).json({ 
            message: 'Ce nom d\'utilisateur est déjà pris.' 
        });
    }

    // Hashage du mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Génération du token de vérification
    const verificationToken = jwt.sign(
        { email: sanitizedData.email }, 
        process.env.JWT_SECRET || 'fallback-secret-change-in-production', 
        { expiresIn: '24h' }
    );

    // Création de l'utilisateur
    const newUser = await User.create({
        email: sanitizedData.email,
        password: hashedPassword,
        nom: sanitizedData.lastName,
        prenom: sanitizedData.firstName,
        username: sanitizedData.username,
        date_naissance: sanitizedData.dateOfBirth,
        verification_token: verificationToken,
        is_verified: false,
        role: 'user',
        login_attempts: 0,
        password_last_changed: new Date()
    });

    // Ajout à l'historique des mots de passe
    await PasswordHistory.create({
        user_id: newUser.id,
        hashed_password: hashedPassword
    });

    // Envoi de l'email de vérification
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:8000'}/verify-account?token=${verificationToken}`;
    
    const emailContent = `
        <h2>Bienvenue sur Tropicool !</h2>
        <p>Bonjour ${sanitizedData.firstName},</p>
        <p>Merci de vous être inscrit sur Tropicool !</p>
        <p>Pour activer votre compte, veuillez cliquer sur le lien suivant :</p>
        <p><a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Vérifier mon compte</a></p>
        <p>Ce lien expire dans 24 heures.</p>
        <p>Cordialement,<br>L'équipe Tropicool</p>
    `;

    await sendEmail(sanitizedData.email, 'Vérification de votre compte Tropicool', emailContent);

    console.log('Nouvel utilisateur inscrit:', sanitizedData.email);
    res.status(201).json({ 
        message: 'Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.',
        userId: newUser.id
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    
    if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
            message: 'Données d\'inscription invalides.',
            details: error.errors.map(err => err.message)
        });
    }
    
    res.status(500).json({ 
        message: 'Une erreur est survenue lors de l\'inscription.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const verifyAccount = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            where: { verification_token: token },
            attributes: ['id', 'email', 'is_verified', 'verification_token']
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Token de vérification invalide.' 
            });
        }

        if (user.is_verified) {
            return res.status(400).json({ 
                message: 'Ce compte est déjà vérifié.' 
            });
        }

        user.is_verified = true;
        user.verification_token = null;
        await user.save();

        console.log('Compte vérifié avec succès:', user.email);
        res.json({ 
            message: 'Compte vérifié avec succès ! Vous pouvez maintenant vous connecter.' 
        });
    } catch (error) {
        console.error('Erreur lors de la vérification du compte:', error);
        res.status(500).json({ 
            message: 'Une erreur est survenue lors de la vérification du compte.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const logout = (req, res) => {
    try {
        // En production, vous pourriez vouloir invalider le token côté serveur
        // en l'ajoutant à une liste noire
        res.json({ 
            message: 'Déconnexion réussie' 
        });
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        res.status(500).json({ 
            message: 'Une erreur est survenue lors de la déconnexion.' 
        });
    }
};

const checkRole = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findOne({
            where: { id: userId },
            attributes: ['id', 'role', 'is_verified']
        });

        if (!user) {
            return res.status(404).json({ 
                message: 'Utilisateur non trouvé.' 
            });
        }

        res.json({ 
            role: user.role,
            isVerified: user.is_verified
        });
    } catch (error) {
        console.error('Erreur lors de la vérification du rôle:', error);
        res.status(500).json({ 
            message: 'Une erreur est survenue lors de la vérification du rôle.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    login,
    register,
    forgotPassword,
    resetPassword,
    verifyAccount,
    logout,
    checkRole,
    validateLogin,
    validateRegister,
    validateForgotPassword,
    validateResetPassword
};
