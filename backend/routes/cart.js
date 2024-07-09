const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/', cartController.getAllCarts);
router.get('/:id', cartController.getCartById);
router.post('/new', cartController.createCart);
router.patch('/:id', cartController.updateCart);
router.delete('/:id', cartController.deleteCart);

module.exports = router;
