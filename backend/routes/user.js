const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateToken = require('../middlewares/checkAuth');

router.get('/', authenticateToken, userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);
router.post('/new', userController.createUser);
router.patch('/:id', authenticateToken, userController.updateUserProfile);
router.delete('/:id', authenticateToken, userController.deleteUser);

module.exports = router;
