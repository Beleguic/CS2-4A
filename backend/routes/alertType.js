const express = require('express');
const router = express.Router();
const alertTypeController = require('../controllers/alertTypeController');

router.get('/', alertTypeController.getAllAlertTypes);
router.get('/:id', alertTypeController.getAlertTypeById);
router.post('/new', alertTypeController.createAlertType);
router.patch('/:id', alertTypeController.updateAlertType);
router.delete('/:id', alertTypeController.deleteAlertType);

module.exports = router;
