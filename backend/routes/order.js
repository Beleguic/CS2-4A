  const express = require('express');
  const router = express.Router();
  const orderController = require('../controllers/orderController');
  const { checkAuth, checkRole, checkOwnership } = require('../middlewares/checkAuth');

  // Routes protégées - Utilisateur authentifié ou Admin
  router.get('/', checkAuth, checkRole(['admin', 'compta']), orderController.getAllOrders);
  router.get('/:id', checkAuth, checkOwnership('user_id'), orderController.getOrderById);
  router.post('/new', checkAuth, orderController.createOrder);
  router.patch('/:id', checkAuth, checkRole(['admin', 'compta']), orderController.updateOrder);
  router.delete('/:id', checkAuth, checkRole(['admin']), orderController.deleteOrder);

  module.exports = router;
