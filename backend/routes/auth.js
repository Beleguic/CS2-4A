const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const checkAuth = require('../middlewares/checkAuth');

// Middleware de validation
const { 
    validateLogin, 
    validateRegister, 
    validateForgotPassword, 
    validateResetPassword 
} = authController;

// Routes avec validation et sécurité
router.post('/login', validateLogin, authController.login);
router.post('/register', validateRegister, authController.register);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.get('/verify/:token', authController.verifyAccount);
router.post('/logout', authController.logout);
router.get('/check-role/:userId', authController.checkRole);

// Routes pour l'expiration des mots de passe
router.get('/password-status', checkAuth, authController.getPasswordStatus);
router.post('/force-password-change', checkAuth, authController.forcePasswordChange);

// Routes pour la gestion des tentatives de connexion (admin seulement)
router.get('/login-attempts', checkAuth, authController.getLoginAttempts);
router.post('/unlock-account/:email', checkAuth, authController.unlockAccount);
router.get('/login-stats', checkAuth, authController.getLoginStats);

// Routes pour l'historique des mots de passe
router.get('/password-history', checkAuth, authController.getPasswordHistory);
router.get('/password-rotation-stats', checkAuth, authController.getPasswordRotationStats);
router.post('/validate-password', checkAuth, authController.validatePassword);

// Routes pour l'expiration des mots de passe
router.get('/password-expiration-stats', checkAuth, authController.getPasswordExpirationStats);
router.get('/expired-users', checkAuth, authController.getExpiredUsers);
router.post('/reset-password-expiration/:userId', checkAuth, authController.resetPasswordExpiration);
router.post('/check-password-expirations', checkAuth, authController.checkPasswordExpirations);

// Routes pour la validation CNIL des mots de passe
router.get('/cnil-requirements', authController.getCNILRequirements);

module.exports = router;
