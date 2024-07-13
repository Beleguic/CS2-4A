const express = require('express');
const router = express.Router();
const livraisonController = require('../controllers/livraisonController');

router.get('/:id', livraisonController.getLivraisonById);
router.post('/new', livraisonController.createLivraison);
router.patch('/:id', livraisonController.updateLivraisonStatus);

module.exports = router;
