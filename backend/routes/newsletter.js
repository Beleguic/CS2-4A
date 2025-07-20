const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { checkAuth, checkRole } = require('../middlewares/checkAuth');

// Routes protégées - Admin uniquement
router.get('/', checkAuth, checkRole(['admin']), newsletterController.getAllNewsletters);
router.get('/:id', checkAuth, checkRole(['admin']), newsletterController.getNewsletterById);
router.post('/new', checkAuth, checkRole(['admin']), newsletterController.createNewsletter);
router.patch('/:id', checkAuth, checkRole(['admin']), newsletterController.updateNewsletter);
router.delete('/:id', checkAuth, checkRole(['admin']), newsletterController.deleteNewsletter);

module.exports = router;
