const express = require('express');
const router = express.Router();
const userHistoryController = require('../controllers/userHistoryController');

router.get('/', userHistoryController.getAllUserHistories);
router.get('/:id', userHistoryController.getUserHistoryById);
router.post('/new', userHistoryController.createUserHistory);
router.patch('/:id', userHistoryController.updateUserHistory);
router.delete('/:id', userHistoryController.deleteUserHistory);

module.exports = router;
