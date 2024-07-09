const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');

router.get('/', alertController.getAllAlerts);
router.get('/:id', alertController.getAlertById);
router.post('/new', alertController.createAlert);
router.patch('/:id', alertController.updateAlert);
router.delete('/:id', alertController.deleteAlert);

module.exports = router;
