const express = require('express');
const router = express.Router();

const stripeController = require('../controllers/stripeController');

// Route pour créer une session de checkout
router.post('/create-checkout-session', stripeController.createCheckoutSession);

// Route pour les webhooks Stripe (doit être en raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

// Route pour récupérer les détails d'une session
router.get('/session/:sessionId', stripeController.getSessionDetails);

module.exports = router;