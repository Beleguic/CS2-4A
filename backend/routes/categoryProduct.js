const express = require('express');
const router = express.Router();
const categoryProductController = require('../controllers/categoryProductController');

router.get('/', categoryProductController.getAllCategoryProducts);
router.get('/:id', categoryProductController.getCategoryProductById);
router.post('/new', categoryProductController.createCategoryProduct);
router.patch('/:id', categoryProductController.updateCategoryProduct);
router.delete('/:id', categoryProductController.deleteCategoryProduct);

module.exports = router;
