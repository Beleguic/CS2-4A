const express = require('express');
const router = express.Router();
const categoryProductController = require('../controllers/categoryProductController');
const { checkAuth, checkRole } = require('../middlewares/checkAuth');

// Routes protégées - Admin uniquement
router.get('/', checkAuth, checkRole(['admin']), categoryProductController.getAllCategoryProducts);
router.get('/:id', checkAuth, checkRole(['admin']), categoryProductController.getCategoryProductById);
router.post('/new', checkAuth, checkRole(['admin']), categoryProductController.createCategoryProduct);
router.patch('/:id', checkAuth, checkRole(['admin']), categoryProductController.updateCategoryProduct);
router.delete('/:id', checkAuth, checkRole(['admin']), categoryProductController.deleteCategoryProduct);

module.exports = router;
