const express = require('express');
const router = express.Router();

const stripeController = require('../controllers/stripeController');

router.post('/new', stripeController.createPaymentIntent);

module.exports = router;