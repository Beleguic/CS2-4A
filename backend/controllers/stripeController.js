const Stripe = require('stripe');
const Joi = require('joi');
const { Order } = require('../models');

const stripe = new Stripe(process.env.STRIPE_SK);

// Schéma de validation pour la création de session Stripe
const createCheckoutSessionSchema = Joi.object({
    cartItems: Joi.array().items(
        Joi.object({
            product_id: Joi.string().required(),
            name: Joi.string().required(),
            price: Joi.number().required(),
            quantity: Joi.number().integer().min(1).required(),
            image: Joi.string().optional()
        })
    ).required(),
    userId: Joi.string().required(),
    successUrl: Joi.string().uri().required(),
    cancelUrl: Joi.string().uri().required(),
    livraisonNumber: Joi.string().optional(),
    adresseFacturation: Joi.object().optional()
});

// Créer une session de checkout Stripe
const createCheckoutSession = async (req, res) => {
    try {
        const { cartItems, userId, successUrl, cancelUrl, livraisonNumber, adresseFacturation } = req.body;

        // Validation des données
        const { error } = createCheckoutSessionSchema.validate({
            cartItems,
            userId,
            successUrl,
            cancelUrl,
            livraisonNumber,
            adresseFacturation
        });

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Préparer les line items pour Stripe
        const lineItems = cartItems.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100), // Convertir en cents
            },
            quantity: item.quantity,
        }));

        // Créer la session Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId,
                livraisonNumber: livraisonNumber || '',
                adresseFacturation: JSON.stringify(adresseFacturation || {}),
                cartItems: JSON.stringify(cartItems)
            },
            customer_email: req.user?.email, // Si l'utilisateur est connecté
        });

        res.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Erreur lors de la création de la session Stripe:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la session de paiement' });
    }
};

// Webhook pour gérer les événements Stripe
const handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.error('Erreur de signature webhook:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object);
                break;
            default:
                console.log(`Événement non géré: ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Erreur lors du traitement du webhook:', error);
        res.status(500).json({ error: 'Erreur lors du traitement du webhook' });
    }
};

// Gérer la session de checkout complétée
const handleCheckoutSessionCompleted = async (session) => {
    try {
        console.log('Session de checkout complétée:', session.id);
        
        const { userId, livraisonNumber, adresseFacturation, cartItems } = session.metadata;
        
        // Créer la commande
        const order = await Order.create({
            user_id: userId,
            products: JSON.parse(cartItems),
            total: session.amount_total / 100, // Convertir de cents en euros
            tva: 0, // À calculer selon votre logique
            isPayed: true,
            livraison: livraisonNumber,
            adresseFacturation: JSON.parse(adresseFacturation),
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent
        });

        console.log('Commande créée:', order.id);
        
        // Ici vous pouvez ajouter d'autres logiques :
        // - Envoyer un email de confirmation
        // - Mettre à jour les stocks
        // - Créer une facture
        // etc.
        
    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        throw error;
    }
};

// Gérer le succès du paiement
const handlePaymentIntentSucceeded = async (paymentIntent) => {
    console.log('Paiement réussi:', paymentIntent.id);
    // Logique supplémentaire si nécessaire
};

// Gérer l'échec du paiement
const handlePaymentIntentFailed = async (paymentIntent) => {
    console.log('Paiement échoué:', paymentIntent.id);
    // Logique pour gérer l'échec du paiement
};

// Récupérer les détails d'une session
const getSessionDetails = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        res.json(session);
    } catch (error) {
        console.error('Erreur lors de la récupération de la session:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la session' });
    }
};

module.exports = {
    createCheckoutSession,
    handleWebhook,
    getSessionDetails,
};
