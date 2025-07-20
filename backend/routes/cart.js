const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { checkAuth, checkOwnership } = require('../middlewares/checkAuth');

// Routes protégées - Utilisateur authentifié uniquement
router.get('/', checkAuth, cartController.getAllCarts);
router.get('/:id', checkAuth, checkOwnership('user_id'), cartController.getCartById);
router.post('/new', checkAuth, cartController.createCart);
router.patch('/:id', checkAuth, checkOwnership('user_id'), cartController.updateCart);
router.delete('/:id', checkAuth, checkOwnership('user_id'), cartController.deleteCart);
router.delete('/', checkAuth, cartController.removeProductFromCart);
router.get('/product/count', checkAuth, cartController.getTotalProductCount);
router.get('/user/:id', checkAuth, checkOwnership('id'), cartController.getCartByUserId);

module.exports = router;
