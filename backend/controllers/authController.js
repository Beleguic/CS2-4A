const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { PasswordHistory } = require('../models');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config({ path: '../.env' });
const Joi = require('joi');
const { Op } = require('sequelize');
const { sendEmail } = require('../services/mailService');
const LoginAttemptService = require('../services/loginAttemptService');
const PasswordRotationService = require('../services/passwordRotationService');
const PasswordExpirationService = require('../services/passwordExpirationService');
const PasswordValidationService = require('../services/passwordValidationService');

// Schémas de validation
const loginSchema = Joi.object({
    email: Joi.string().email().required().max(255),
    password: Joi.string().required().min(1)
});

// Utiliser le service de validation CNIL pour l'inscription
const registerSchema = PasswordValidationService.getRegistrationSchema();

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().max(255)
});

const resetPasswordSchema = Joi.object({
    token: Joi.string().required().length(40),
    password: PasswordValidationService.getPasswordSchema()
        .required()
        .messages({
            'string.empty': 'Le mot de passe est requis',
            'any.required': 'Le mot de passe est requis'
        })
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
    if (user.isAccountLocked()) {
      const remainingTime = user.getLockRemainingTime();
      console.log('Tentative de connexion avec un compte verrouillé:', sanitizedEmail);
      return res.status(401).json({ 
          message: `Compte temporairement verrouillé. Réessayez dans ${remainingTime} minutes.`, 
          loginAttempts: user.login_attempts,
          lockUntil: user.lock_until
      });
    }

    // Vérification de l'expiration du mot de passe
    if (user.isPasswordExpired()) {
      await PasswordExpirationService.forcePasswordChange(user.id);
      console.log('Mot de passe expiré, changement forcé requis:', sanitizedEmail);
      return res.status(403).json({
          message: 'Votre mot de passe a expiré. Vous devez le changer pour continuer.',
          forcePasswordChange: true
      });
    }

    // Vérification du mot de passe
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // Gérer la tentative échouée avec le nouveau service
      const attemptResult = await LoginAttemptService.handleFailedLoginAttempt(sanitizedEmail);
      
      console.log('Tentative de connexion échouée:', sanitizedEmail, 'Tentatives:', user.login_attempts);
      
      if (attemptResult.shouldLock) {
        return res.status(401).json({
            message: `Compte temporairement verrouillé suite à plusieurs tentatives échouées. Un email a été envoyé.`,
            loginAttempts: user.login_attempts,
            lockUntil: user.lock_until,
            lockDuration: attemptResult.lockDuration
        });
      }
      
      return res.status(401).json({ 
          message: 'Email ou mot de passe incorrect', 
          loginAttempts: attemptResult.remainingAttempts,
          remainingAttempts: attemptResult.remainingAttempts
      });
    }

    // Connexion réussie - réinitialiser les tentatives
    await LoginAttemptService.handleSuccessfulLogin(sanitizedEmail);

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
        expiresIn: 3600, // 1 heure en secondes
        passwordStatus: {
            isExpired: user.isPasswordExpired(),
            isExpiringSoon: user.isPasswordExpiringSoon(),
            daysUntilExpiration: user.getDaysUntilPasswordExpiration(),
            forcePasswordChange: user.force_password_change
        },
        accountStatus: {
            isLocked: user.isAccountLocked(),
            lockRemainingTime: user.getLockRemainingTime(),
            loginAttempts: user.login_attempts
        }
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

// Vérifier le statut du mot de passe d'un utilisateur
const getPasswordStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ 
                message: 'Utilisateur non trouvé.' 
            });
        }

        const passwordStatus = {
            isExpired: user.isPasswordExpired(),
            isExpiringSoon: user.isPasswordExpiringSoon(),
            daysUntilExpiration: user.getDaysUntilPasswordExpiration(),
            expirationDate: user.getPasswordExpirationDate(),
            forcePasswordChange: user.force_password_change,
            lastChanged: user.password_last_changed
        };

        res.json(passwordStatus);
    } catch (error) {
        console.error('Erreur lors de la vérification du statut du mot de passe:', error);
        res.status(500).json({ 
            message: 'Une erreur est survenue lors de la vérification du statut du mot de passe.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Changement forcé de mot de passe
const forcePasswordChange = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Validation des données
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                error: 'Le mot de passe actuel et le nouveau mot de passe sont requis.' 
            });
        }

        // Validation du nouveau mot de passe
        const passwordValidation = Joi.string()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/)
            .message('Le mot de passe doit contenir au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial')
            .validate(newPassword);

        if (passwordValidation.error) {
            return res.status(400).json({ 
                error: passwordValidation.error.message 
            });
        }

        // Récupérer l'utilisateur
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ 
                error: 'Utilisateur non trouvé.' 
            });
        }

        // Vérifier le mot de passe actuel
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ 
                error: 'Le mot de passe actuel est incorrect.' 
            });
        }

        // Vérifier que le nouveau mot de passe est différent de l'actuel
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ 
                error: 'Le nouveau mot de passe doit être différent de l\'actuel.' 
            });
        }

                // Vérifier l'historique des mots de passe avec le service de rotation
        const validation = await PasswordRotationService.validateNewPassword(userId, newPassword, true);
        if (!validation.isValid) {
          return res.status(400).json({ 
            error: validation.errors.join('. '),
            warnings: validation.warnings,
            strength: validation.strength
          });
        }

        // Mettre à jour le mot de passe avec rotation
        const rotationResult = await PasswordRotationService.rotatePassword(userId, newPassword, false);

        console.log('Mot de passe changé avec succès pour l\'utilisateur:', user.email);
        
        res.json({ 
            message: 'Mot de passe changé avec succès !',
            strength: rotationResult.strength,
            strengthDetails: rotationResult.strengthDetails
        });
    } catch (error) {
        console.error('Erreur lors du changement forcé de mot de passe:', error);
        res.status(500).json({ 
            error: 'Une erreur est survenue lors du changement de mot de passe.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtenir les tentatives de connexion récentes (admin)
const getLoginAttempts = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Accès refusé. Rôle administrateur requis.' 
            });
        }

        const limit = parseInt(req.query.limit) || 50;
        const attempts = await LoginAttemptService.getRecentLoginAttempts(limit);

        res.json(attempts);
    } catch (error) {
        console.error('Erreur lors de la récupération des tentatives de connexion:', error);
        res.status(500).json({ 
            error: 'Une erreur est survenue lors de la récupération des tentatives de connexion.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Déverrouiller un compte (admin)
const unlockAccount = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Accès refusé. Rôle administrateur requis.' 
            });
        }

        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({ 
                error: 'Email requis pour déverrouiller le compte.' 
            });
        }

        await LoginAttemptService.unlockAccount(email);

        res.json({ 
            message: `Compte ${email} déverrouillé avec succès.` 
        });
    } catch (error) {
        console.error('Erreur lors du déverrouillage du compte:', error);
        res.status(500).json({ 
            error: 'Une erreur est survenue lors du déverrouillage du compte.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtenir les statistiques des tentatives de connexion (admin)
const getLoginStats = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Accès refusé. Rôle administrateur requis.' 
            });
        }

        const stats = await LoginAttemptService.getLoginAttemptStats();

        // Calculer des statistiques supplémentaires
        const totalLocked = stats.filter(user => user.isLocked).length;
        const totalAttempts = stats.reduce((sum, user) => sum + user.loginAttempts, 0);
        const averageAttempts = stats.length > 0 ? (totalAttempts / stats.length).toFixed(2) : 0;

        const summary = {
            totalUsers: stats.length,
            totalLocked,
            totalAttempts,
            averageAttempts: parseFloat(averageAttempts),
            users: stats
        };

        res.json(summary);
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ 
            error: 'Une erreur est survenue lors de la récupération des statistiques.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtenir l'historique des mots de passe d'un utilisateur
const getPasswordHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        
        const history = await PasswordRotationService.getPasswordHistory(userId, limit);
        
        res.json(history);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique des mots de passe:', error);
        res.status(500).json({ 
            error: 'Une erreur est survenue lors de la récupération de l\'historique.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtenir les statistiques de rotation des mots de passe (admin)
const getPasswordRotationStats = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Accès refusé. Rôle administrateur requis.' 
            });
        }

        const stats = await PasswordRotationService.getPasswordRotationStats();
        
        res.json(stats);
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques de rotation:', error);
        res.status(500).json({ 
            error: 'Une erreur est survenue lors de la récupération des statistiques.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Valider un mot de passe avant changement
const validatePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { password, checkHistory = true } = req.body;

        if (!password) {
            return res.status(400).json({ 
                error: 'Mot de passe requis pour la validation.' 
            });
        }

        const validation = await PasswordRotationService.validateNewPassword(userId, password, checkHistory);
        
        res.json(validation);
    } catch (error) {
        console.error('Erreur lors de la validation du mot de passe:', error);
        res.status(500).json({ 
            error: 'Une erreur est survenue lors de la validation du mot de passe.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtenir les statistiques d'expiration des mots de passe (admin)
const getPasswordExpirationStats = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Accès refusé. Rôle administrateur requis.' 
            });
        }

        const stats = await PasswordExpirationService.getExpirationStats();
        
        res.json(stats);
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques d\'expiration:', error);
        res.status(500).json({ 
            error: 'Une erreur est survenue lors de la récupération des statistiques.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtenir la liste des utilisateurs avec des mots de passe expirés (admin)
const getExpiredUsers = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Accès refusé. Rôle administrateur requis.' 
            });
        }

        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        const users = await PasswordExpirationService.getExpiredUsers(limit, offset);
        
        res.json(users);
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs expirés:', error);
        res.status(500).json({ 
            error: 'Une erreur est survenue lors de la récupération des utilisateurs.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Réinitialiser l'expiration d'un mot de passe (admin)
const resetPasswordExpiration = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Accès refusé. Rôle administrateur requis.' 
            });
        }

        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ 
                error: 'ID utilisateur requis.' 
            });
        }

        await PasswordExpirationService.resetPasswordExpiration(userId);

        res.json({ 
            message: 'Expiration du mot de passe réinitialisée avec succès.' 
        });
    } catch (error) {
        console.error('Erreur lors de la réinitialisation de l\'expiration:', error);
        res.status(500).json({ 
            error: 'Une erreur est survenue lors de la réinitialisation.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Vérifier et traiter l'expiration des mots de passe (admin)
const checkPasswordExpirations = async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Accès refusé. Rôle administrateur requis.' 
            });
        }

        const result = await PasswordExpirationService.checkPasswordExpirations();
        
        res.json({
            message: 'Vérification de l\'expiration terminée',
            ...result
        });
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'expiration:', error);
        res.status(500).json({ 
            error: 'Une erreur est survenue lors de la vérification.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtenir les exigences CNIL pour les mots de passe
const getCNILRequirements = async (req, res) => {
    try {
        const requirements = PasswordValidationService.getCNILRequirements();
        
        res.json({
            success: true,
            requirements: requirements
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des exigences CNIL:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la récupération des exigences CNIL'
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
    getPasswordStatus,
    forcePasswordChange,
    getLoginAttempts,
    unlockAccount,
    getLoginStats,
    getPasswordHistory,
    getPasswordRotationStats,
    validatePassword,
    getPasswordExpirationStats,
    getExpiredUsers,
    resetPasswordExpiration,
    checkPasswordExpirations,
    getCNILRequirements,
    validateLogin,
    validateRegister,
    validateForgotPassword,
    validateResetPassword
};
