const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const checkAuth = require('../middlewares/checkAuth');

router.get('/', checkAuth, alertController.getAllAlerts);
router.get('/:id', checkAuth, alertController.getAlertById);
router.post('/new', checkAuth, alertController.createAlert);
router.patch('/:id', checkAuth, alertController.updateAlert);
router.delete('/:id', checkAuth, alertController.deleteAlert);

module.exports = router;
