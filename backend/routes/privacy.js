const express = require('express');
const router = express.Router();
const privacyController = require('../controllers/privacyController');
const checkAuth = require('../middlewares/checkAuth');

// Toutes les routes nécessitent une authentification
router.use(checkAuth);

// Routes pour les utilisateurs connectés
router.get('/preferences', privacyController.getUserPreferences);
router.put('/preferences', privacyController.updateUserPreferences);
router.post('/level', privacyController.applyPrivacyLevel);
router.post('/reset', privacyController.resetPreferences);

// Routes de vérification des permissions
router.get('/marketing', privacyController.checkMarketingPermissions);
router.get('/analytics', privacyController.checkAnalyticsPermissions);
router.get('/personalization', privacyController.checkPersonalizationPermissions);
router.get('/profile-visibility', privacyController.getProfileVisibility);

// Routes d'administration (admin uniquement)
router.get('/stats', privacyController.getPrivacyStats);
router.post('/cleanup', privacyController.cleanupExpiredPreferences);
router.get('/users/:userId/preferences', privacyController.getUserPreferencesById);
router.put('/users/:userId/preferences', privacyController.updateUserPreferencesById);

// Documentation
router.get('/documentation', privacyController.getPrivacyDocumentation);

module.exports = router; 