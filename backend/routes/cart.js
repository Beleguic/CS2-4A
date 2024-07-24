const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const checkAuth = require('../middlewares/checkAuth');

router.get('/', checkAuth, cartController.getAllCarts);
router.get('/:id', checkAuth, cartController.getCartById);
router.post('/new', checkAuth, cartController.createCart);
router.patch('/:id', checkAuth, cartController.updateCart);
router.delete('/:id', checkAuth, cartController.deleteCart);
router.delete('/', checkAuth, cartController.removeProductFromCart);
router.get('/product/count', checkAuth, cartController.getTotalProductCount);
router.get('/user/:id', checkAuth, cartController.getCartByUserId);
module.exports = router;
