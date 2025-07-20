const express = require('express');
const router = express.Router();

const stripeController = require('../controllers/stripeController');

// Route pour créer un PaymentIntent (pour Stripe Elements)
router.post('/create-payment-intent', stripeController.createPaymentIntent);

// Route pour créer une session Checkout (pour Stripe Checkout)
router.post('/create-checkout-session', stripeController.createCheckoutSession);

// Route pour récupérer les détails d'une session
router.get('/session/:sessionId', stripeController.getSessionDetails);

// Route pour les webhooks Stripe (doit être en raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

module.exports = router;