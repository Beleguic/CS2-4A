const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const checkAuth = require('../middlewares/checkAuth');

// Toutes les routes nécessitent une authentification
router.use(checkAuth);

// Routes d'export
router.post('/inpi', exportController.exportForINPI);
router.post('/postgresql', exportController.exportPostgreSQL);
router.post('/mongodb', exportController.exportMongoDB);

// Routes de gestion des exports
router.get('/', exportController.listExports);
router.get('/documentation', exportController.getExportDocumentation);
router.get('/:exportId', exportController.getExportDetails);
router.get('/:exportId/download', exportController.downloadExport);
router.delete('/:exportId', exportController.deleteExport);
router.post('/cleanup', exportController.cleanupExports);

module.exports = router; 