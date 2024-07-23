const Stripe = require('stripe');
const Joi = require('joi');

const stripe = new Stripe(process.env.STRIPE_SK); // Utilisez les variables d'environnement

const stripeSchema = Joi.object({
    amount: Joi.number().integer().min(0).required(),
});

const createPaymentIntent = async (req, res, next) => {
    console.log("createPaymentIntent");
    const { amount } = req.body;


    // Validation des données d'entrée
    const { error } = stripeSchema.validate({ amount });
    if (error) {
        return res.status(400).send({ error: error.details[0].message });
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'eur',
        });

        console.log("paymentIntent", paymentIntent);

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        // Gestion des erreurs Stripe
        if (error.type === 'StripeCardError') {
            // Les erreurs générées par les paiements avec la carte
            return res.status(400).send({ error: error.message });
        } else {
            // Autres erreurs Stripe
            return res.status(500).send({ error: 'Une erreur est survenue lors de la création du PaymentIntent' });
        }
    }
};

module.exports = {
    createPaymentIntent,
};
