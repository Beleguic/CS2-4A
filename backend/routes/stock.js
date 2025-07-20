const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { checkAuth, checkRole } = require('../middlewares/checkAuth');

// Routes protégées - Admin et Store Keeper uniquement
router.get('/', checkAuth, checkRole(['admin', 'store-keeper']), stockController.getAllStocks);
router.get('/store-keeper/:product_id', checkAuth, checkRole(['admin', 'store-keeper']), stockController.getStockByIdForStoreKeeper);
router.get('/store-keeper', checkAuth, checkRole(['admin', 'store-keeper']), stockController.getAllStocksForStoreKeeper);
router.get('/store-keeper/graph/:product_id', checkAuth, checkRole(['admin', 'store-keeper']), stockController.getStockByDay);
router.get('/:id', checkAuth, checkRole(['admin', 'store-keeper']), stockController.getStockById);

// Routes de modification - Admin uniquement
router.post('/new', checkAuth, checkRole(['admin']), stockController.createStock);
router.patch('/:id', checkAuth, checkRole(['admin', 'store-keeper']), stockController.updateStock);
router.delete('/:id', checkAuth, checkRole(['admin']), stockController.deleteStock);

module.exports = router;
