const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');

router.get('/', newsletterController.getAllNewsletters);
router.get('/:id', newsletterController.getNewsletterById);
router.post('/new', newsletterController.createNewsletter);
router.patch('/:id', newsletterController.updateNewsletter);
router.delete('/:id', newsletterController.deleteNewsletter);

module.exports = router;
