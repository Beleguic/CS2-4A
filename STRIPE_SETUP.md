# Configuration Stripe avec Webhooks

## Variables d'Environnement Requises

Ajoutez ces variables dans votre fichier `.env` du backend :

```env
# Configuration Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Configuration Frontend
FRONTEND_URL=http://localhost:8000
```

## Configuration du Frontend

Dans votre fichier `.env` du frontend (tropicool/.env) :

```env
VITE_STRIPE_PK=pk_test_your_stripe_publishable_key_here
VITE_API_URL=http://localhost:3000
```

## Configuration des Webhooks Stripe

### 1. Créer un endpoint webhook dans Stripe Dashboard

1. Allez sur [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Cliquez sur "Add endpoint"
3. Entrez l'URL de votre webhook : `http://localhost:3000/stripe/webhook`
4. Sélectionnez les événements à écouter :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Cliquez sur "Add endpoint"

### 2. Récupérer le secret du webhook

1. Dans la liste des webhooks, cliquez sur votre endpoint
2. Copiez le "Signing secret" (commence par `whsec_`)
3. Ajoutez-le à votre variable `STRIPE_WEBHOOK_SECRET`

## Test des Webhooks en Local

### Option 1: Stripe CLI (Recommandé)

1. Installez Stripe CLI : https://stripe.com/docs/stripe-cli
2. Connectez-vous : `stripe login`
3. Forwardez les webhooks : `stripe listen --forward-to localhost:3000/stripe/webhook`

### Option 2: ngrok

1. Installez ngrok : https://ngrok.com/
2. Exposez votre serveur : `ngrok http 3000`
3. Utilisez l'URL ngrok dans votre webhook Stripe

## Fonctionnalités Implémentées

### ✅ Stripe Checkout
- Redirection vers Stripe Checkout
- Gestion des sessions de paiement
- Retour automatique après paiement

### ✅ Webhooks
- `payment_intent.succeeded` : Marquer la commande comme payée
- `payment_intent.payment_failed` : Marquer la commande comme échouée
- `charge.refunded` : Gérer les remboursements

### ✅ Gestion des Commandes
- Création automatique de commande
- Mise à jour du statut via webhooks
- Stockage des IDs Stripe

### ✅ Interface Utilisateur
- Formulaire de livraison simplifié
- Page de confirmation avec statut
- Gestion des erreurs

## Routes API

### Backend
- `POST /stripe/create-payment-intent` - Créer un PaymentIntent
- `POST /stripe/create-checkout-session` - Créer une session Checkout
- `GET /stripe/session/:sessionId` - Récupérer les détails d'une session
- `POST /stripe/webhook` - Endpoint webhook Stripe

### Frontend
- `/payment` - Page de paiement avec Stripe Checkout
- `/confirmation` - Page de confirmation après paiement

## Sécurité

- ✅ Signature des webhooks vérifiée
- ✅ Variables d'environnement sécurisées
- ✅ Validation des données d'entrée
- ✅ Gestion des erreurs robuste

## Déploiement

### Production
1. Utilisez les clés Stripe en mode production
2. Configurez l'URL de production pour les webhooks
3. Assurez-vous que `FRONTEND_URL` pointe vers votre domaine
4. Activez HTTPS pour les webhooks

### Variables d'Environnement Production
```env
STRIPE_SECRET_KEY=sk_live_your_production_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
FRONTEND_URL=https://yourdomain.com
``` 