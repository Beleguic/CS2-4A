const express = require('express');
const router = express.Router();
const livraisonController = require('../controllers/livraisonController.js');

// Middleware de validation
const { validateLivraison, validateStatus } = livraisonController;

// Routes avec validation et sécurité
router.get('/', livraisonController.getAllLivraison);
router.get('/:id', livraisonController.getLivraisonById);
router.post('/new', validateLivraison, livraisonController.createLivraison);
router.patch('/:id/status', validateStatus, livraisonController.updateLivraisonStatus);
router.delete('/:id', livraisonController.deleteLivraison);

module.exports = router;
