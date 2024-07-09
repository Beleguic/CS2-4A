const express = require('express');
const router = express.Router();
const passwordHistoryController = require('../controllers/passwordHistoryController');

router.get('/', passwordHistoryController.getAllPasswordHistories);
router.get('/:id', passwordHistoryController.getPasswordHistoryById);
router.post('/new', passwordHistoryController.createPasswordHistory);
router.patch('/:id', passwordHistoryController.updatePasswordHistory);
router.delete('/:id', passwordHistoryController.deletePasswordHistory);

module.exports = router;
