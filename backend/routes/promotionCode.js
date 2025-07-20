const express = require('express');
const router = express.Router();
const promotionCodeController = require('../controllers/promotionCodeController');
const { checkAuth, checkRole } = require('../middlewares/checkAuth');

// Routes protégées - Admin uniquement
router.get('/', checkAuth, checkRole(['admin']), promotionCodeController.getAllPromotionCodes);
router.get('/:id', checkAuth, checkRole(['admin']), promotionCodeController.getPromotionCodeById);
router.post('/new', checkAuth, checkRole(['admin']), promotionCodeController.createPromotionCode);
router.patch('/:id', checkAuth, checkRole(['admin']), promotionCodeController.updatePromotionCode);
router.delete('/:id', checkAuth, checkRole(['admin']), promotionCodeController.deletePromotionCode);

module.exports = router;
