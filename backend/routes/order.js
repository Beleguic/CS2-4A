  const express = require('express');
  const router = express.Router();
  const orderController = require('../controllers/orderController');

  router.get('/', orderController.getAllOrders);
  router.get('/:id', orderController.getOrderById);
  router.post('/new', orderController.createOrder);
  router.patch('/:id', orderController.updateOrder);
  router.delete('/:id', orderController.deleteOrder);

  module.exports = router;
