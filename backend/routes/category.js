const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/list', categoryController.getAllCategoriesForSelection);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/new', categoryController.createCategory);
router.patch('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;
