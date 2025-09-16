const Stripe = require('stripe');
const Joi = require('joi');

const stripe = new Stripe(process.env.STRIPE_SK); // Utilisez les variables d'environnement

const stripeSchema = Joi.object({
    amount: Joi.number().integer().min(0).required(),
});

const endpointSecret = 'gfqfdqsjhfldqshjflqsdhjflk';

const createPaymentIntent = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`⚠️  Webhook signature verification failed: ${err.message}`);
        return res.sendStatus(400);
    }

    // Gérer les différents types d'événements
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
            break;
        case 'payment_method.attached':
            const paymentMethod = event.data.object;
            console.log(`PaymentMethod ${paymentMethod.id} attached to customer`);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).end();
};

module.exports = {
    createPaymentIntent,
};
