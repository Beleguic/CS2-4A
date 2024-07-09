const express = require('express');
const router = express.Router();
const productPromotionController = require('../controllers/productPromotionController');

router.get('/', productPromotionController.getAllProductPromotions);
router.get('/:id', productPromotionController.getProductPromotionById);
router.post('/new', productPromotionController.createProductPromotion);
router.patch('/:id', productPromotionController.updateProductPromotion);
router.delete('/:id', productPromotionController.deleteProductPromotion);

module.exports = router;
