const express = require('express');
const router = express.Router();
const userHistoryController = require('../controllers/userHistoryController');
const { checkAuth, checkRole } = require('../middlewares/checkAuth');

// Routes protégées - Admin uniquement
router.get('/', checkAuth, checkRole(['admin']), userHistoryController.getAllUserHistories);
router.get('/:id', checkAuth, checkRole(['admin']), userHistoryController.getUserHistoryById);
router.post('/new', checkAuth, checkRole(['admin']), userHistoryController.createUserHistory);
router.patch('/:id', checkAuth, checkRole(['admin']), userHistoryController.updateUserHistory);
router.delete('/:id', checkAuth, checkRole(['admin']), userHistoryController.deleteUserHistory);

module.exports = router;
