const express = require('express');
const router = express.Router();
const passwordHistoryController = require('../controllers/passwordHistoryController');
const { checkAuth, checkRole } = require('../middlewares/checkAuth');

// Routes protégées - Admin uniquement
router.get('/', checkAuth, checkRole(['admin']), passwordHistoryController.getAllPasswordHistories);
router.get('/:id', checkAuth, checkRole(['admin']), passwordHistoryController.getPasswordHistoryById);
router.post('/new', checkAuth, checkRole(['admin']), passwordHistoryController.createPasswordHistory);
router.patch('/:id', checkAuth, checkRole(['admin']), passwordHistoryController.updatePasswordHistory);
router.delete('/:id', checkAuth, checkRole(['admin']), passwordHistoryController.deletePasswordHistory);

module.exports = router;
