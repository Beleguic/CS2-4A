const express = require('express');
const router = express.Router();
const promotionCodeController = require('../controllers/promotionCodeController');

router.get('/', promotionCodeController.getAllPromotionCodes);
router.get('/:id', promotionCodeController.getPromotionCodeById);
router.post('/new', promotionCodeController.createPromotionCode);
router.patch('/:id', promotionCodeController.updatePromotionCode);
router.delete('/:id', promotionCodeController.deletePromotionCode);

module.exports = router;
