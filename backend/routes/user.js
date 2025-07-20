const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { checkAuth } = require('../middlewares/checkAuth');

router.get('/', checkAuth, userController.getAllUsers);
router.get('/:id', checkAuth, userController.getUserById);
router.post('/new', checkAuth, userController.createUser);
router.patch('/:id', checkAuth, userController.updateUser);
router.delete('/:id', checkAuth, userController.deleteUser);

// Routes pour l'export des données personnelles (RGPD)
router.post('/:id/export', checkAuth, userController.exportUserData);
router.get('/:id/export/download/:format', checkAuth, userController.downloadExport);

// Routes pour l'anonymisation des données (RGPD)
router.post('/:id/anonymize', checkAuth, userController.anonymizeUser);
router.post('/check-email-recreation', userController.checkEmailRecreation);
router.post('/:id/restore', checkAuth, userController.restoreAnonymizedUser);
router.get('/anonymization-stats', checkAuth, userController.getAnonymizationStats);

module.exports = router;
