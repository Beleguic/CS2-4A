const express = require('express');
const router = express.Router();
const alertTypeController = require('../controllers/alertTypeController');
const { checkAuth, checkRole } = require('../middlewares/checkAuth');

// Routes protégées - Admin uniquement
router.get('/', checkAuth, checkRole(['admin']), alertTypeController.getAllAlertTypes);
router.get('/:id', checkAuth, checkRole(['admin']), alertTypeController.getAlertTypeById);
router.post('/new', checkAuth, checkRole(['admin']), alertTypeController.createAlertType);
router.patch('/:id', checkAuth, checkRole(['admin']), alertTypeController.updateAlertType);
router.delete('/:id', checkAuth, checkRole(['admin']), alertTypeController.deleteAlertType);

module.exports = router;
