const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const checkAuth = require('../middlewares/checkAuth');

// Toutes les routes nécessitent une authentification
router.use(checkAuth);

// Routes principales d'audit
router.get('/logs', auditController.getAuditLogs);
router.get('/stats', auditController.getAuditStats);
router.get('/logs/:logId', auditController.getAuditLogById);

// Routes spécialisées
router.get('/users/:userId/logs', auditController.getUserAuditLogs);
router.get('/critical', auditController.getCriticalAuditLogs);
router.get('/security', auditController.getSecurityAuditLogs);
router.get('/rgpd', auditController.getRGPDAuditLogs);

// Routes de maintenance
router.post('/cleanup', auditController.cleanupExpiredLogs);
router.get('/export', auditController.exportAuditLogs);

// Routes en temps réel
router.get('/realtime', auditController.getRealTimeAuditLogs);

// Documentation
router.get('/documentation', auditController.getAuditDocumentation);

module.exports = router; 