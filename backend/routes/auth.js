const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

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

module.exports = router;
