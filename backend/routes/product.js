const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/products-with-stock', productController.getAllProductsWithStock);
router.get('/list', productController.getAllProductsForSelection);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/new', productController.createProduct);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
