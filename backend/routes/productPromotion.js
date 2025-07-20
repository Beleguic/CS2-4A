const express = require('express');
const router = express.Router();
const productPromotionController = require('../controllers/productPromotionController');
const { checkAuth, checkRole } = require('../middlewares/checkAuth');

// Routes protégées - Admin uniquement
router.get('/', checkAuth, checkRole(['admin']), productPromotionController.getAllProductPromotions);
router.get('/:id', checkAuth, checkRole(['admin']), productPromotionController.getProductPromotionById);
router.post('/new', checkAuth, checkRole(['admin']), productPromotionController.createProductPromotion);
router.patch('/:id', checkAuth, checkRole(['admin']), productPromotionController.updateProductPromotion);
router.delete('/:id', checkAuth, checkRole(['admin']), productPromotionController.deleteProductPromotion);

module.exports = router;
