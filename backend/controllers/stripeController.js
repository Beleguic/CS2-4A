const Stripe = require('stripe');
const Joi = require('joi');
const Order = require('../models/order');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const stripeSchema = Joi.object({
    amount: Joi.number().integer().min(0).required(),
    order_id: Joi.string().uuid().required(),
    customer_email: Joi.string().email().required(),
});

// Créer un PaymentIntent avec métadonnées pour l'order_id
const createPaymentIntent = async (req, res, next) => {
    console.log("createPaymentIntent");
    const { amount, order_id, customer_email } = req.body;

    // Validation des données d'entrée
    const { error } = stripeSchema.validate({ amount, order_id, customer_email });
    if (error) {
        return res.status(400).send({ error: error.details[0].message });
    }

    try {
        // Créer ou récupérer le client Stripe
        let customer;
        const existingCustomers = await stripe.customers.list({
            email: customer_email,
            limit: 1
        });

        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
        } else {
            customer = await stripe.customers.create({
                email: customer_email,
            });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'eur',
            customer: customer.id,
            metadata: {
                order_id: order_id,
                customer_email: customer_email
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        console.log("paymentIntent created:", paymentIntent.id);

        res.send({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        });
    } catch (error) {
        console.error("Stripe error:", error);
        if (error.type === 'StripeCardError') {
            return res.status(400).send({ error: error.message });
        } else {
            return res.status(500).send({ error: 'Une erreur est survenue lors de la création du PaymentIntent' });
        }
    }
};

// Gérer les webhooks Stripe
const handleWebhook = async (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('Webhook event received:', event.type);

    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentFailure(event.data.object);
                break;
            case 'charge.refunded':
                await handleRefund(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).send({ error: 'Webhook processing failed' });
    }
};

// Gérer le succès du paiement
const handlePaymentSuccess = async (paymentIntent) => {
    console.log('Payment succeeded:', paymentIntent.id);
    
    const orderId = paymentIntent.metadata.order_id;
    
    if (orderId) {
        try {
            // Mettre à jour la commande comme payée
            await Order.update(
                { 
                    isPayed: true,
                    stripe_payment_intent_id: paymentIntent.id,
                    payment_status: 'succeeded',
                    paid_at: new Date()
                },
                { 
                    where: { id: orderId } 
                }
            );

            console.log(`Order ${orderId} marked as paid`);
            
            // Ici vous pouvez ajouter d'autres actions :
            // - Envoyer un email de confirmation
            // - Mettre à jour les stocks
            // - Créer la facture
            // - etc.
            
        } catch (error) {
            console.error('Error updating order after payment success:', error);
        }
    }
};

// Gérer l'échec du paiement
const handlePaymentFailure = async (paymentIntent) => {
    console.log('Payment failed:', paymentIntent.id);
    
    const orderId = paymentIntent.metadata.order_id;
    
    if (orderId) {
        try {
            await Order.update(
                { 
                    isPayed: false,
                    stripe_payment_intent_id: paymentIntent.id,
                    payment_status: 'failed',
                    payment_error: paymentIntent.last_payment_error?.message || 'Payment failed'
                },
                { 
                    where: { id: orderId } 
                }
            );

            console.log(`Order ${orderId} marked as payment failed`);
            
        } catch (error) {
            console.error('Error updating order after payment failure:', error);
        }
    }
};

// Gérer les remboursements
const handleRefund = async (charge) => {
    console.log('Refund processed:', charge.id);
    
    // Logique pour gérer les remboursements
    // Vous pouvez mettre à jour le statut de la commande
    // et envoyer un email de confirmation de remboursement
};

// Créer un lien de paiement Stripe Checkout
const createCheckoutSession = async (req, res, next) => {
    const { amount, order_id, customer_email, success_url, cancel_url } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Commande Tropicool',
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: success_url || `${process.env.FRONTEND_URL}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancel_url || `${process.env.FRONTEND_URL}/cart`,
            customer_email: customer_email,
            metadata: {
                order_id: order_id,
            },
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).send({ error: 'Erreur lors de la création de la session de paiement' });
    }
};

// Récupérer les détails d'une session de paiement
const getSessionDetails = async (req, res, next) => {
    const { sessionId } = req.params;

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        res.json(session);
    } catch (error) {
        console.error('Error retrieving session:', error);
        res.status(500).send({ error: 'Erreur lors de la récupération de la session' });
    }
};

module.exports = {
    createPaymentIntent,
    handleWebhook,
    createCheckoutSession,
    getSessionDetails,
};
