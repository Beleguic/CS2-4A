const express = require('express');
const router = express.Router();
const cookieConsentController = require('../controllers/cookieConsentController');
const checkAuth = require('../middlewares/checkAuth');

// Routes publiques (pas d'authentification requise)
router.post('/save', cookieConsentController.saveConsent);
router.get('/current', cookieConsentController.getConsent);

// Routes protégées (authentification requise)
router.delete('/delete', checkAuth, cookieConsentController.deleteConsent);

// Routes admin seulement
router.get('/stats', checkAuth, cookieConsentController.getConsentStats);

module.exports = router; 