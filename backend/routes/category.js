const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { checkAuth, checkRole } = require('../middlewares/checkAuth');

// Routes publiques (lecture seule)
router.get('/list', categoryController.getAllCategoriesForSelection);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Routes protégées (CRUD complet) - Admin uniquement
router.post('/new', checkAuth, checkRole(['admin']), categoryController.createCategory);
router.patch('/:id', checkAuth, checkRole(['admin']), categoryController.updateCategory);
router.delete('/:id', checkAuth, checkRole(['admin']), categoryController.deleteCategory);

module.exports = router;
