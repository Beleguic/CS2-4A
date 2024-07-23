const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

router.get('/', stockController.getAllStocks);
router.get('/store-keeper/:product_id', stockController.getStockByIdForStoreKeeper);
router.get('/store-keeper', stockController.getAllStocksForStoreKeeper);
router.get('/store-keeper/graph/:product_id', stockController.getStockByDay);
router.get('/:id', stockController.getStockById);
router.post('/new', stockController.createStock);
router.patch('/:id', stockController.updateStock);
router.delete('/:id', stockController.deleteStock);

module.exports = router;
