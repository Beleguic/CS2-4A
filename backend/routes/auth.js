const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/register', authController.register);
router.get('/verify/:token', authController.verifyAccount);
router.post('/logout', authController.logout);
router.get('/check-role', authController.checkRole);

module.exports = router;