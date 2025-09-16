# Configuration Stripe avec Webhooks

## Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env` dans le dossier `backend/` :

```env
# Stripe
STRIPE_SK=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## Configuration des Webhooks Stripe

1. **Connectez-vous à votre dashboard Stripe** : https://dashboard.stripe.com/

2. **Allez dans "Developers" > "Webhooks"**

3. **Cliquez sur "Add endpoint"**

4. **Configurez l'endpoint** :
   - **URL** : `https://votre-domaine.com/stripe/webhook`
   - **Événements à écouter** :
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`

5. **Récupérez la clé secrète** du webhook et ajoutez-la à `STRIPE_WEBHOOK_SECRET`

## Test en local avec ngrok

Pour tester les webhooks en local :

1. **Installez ngrok** : https://ngrok.com/

2. **Exposez votre serveur local** :
   ```bash
   ngrok http 3000
   ```

3. **Utilisez l'URL ngrok** pour configurer le webhook dans Stripe

## Migration de la base de données

Après avoir ajouté les nouveaux champs Stripe au modèle Order, exécutez :

```bash
cd backend
npm run migrate
```

## Test de l'intégration

1. **Démarrez les services** :
   ```bash
   docker compose up
   ```

2. **Testez le paiement** :
   - Allez sur http://localhost:8000
   - Ajoutez des produits au panier
   - Procédez au paiement
   - Vous serez redirigé vers Stripe Checkout

3. **Vérifiez les webhooks** :
   - Consultez les logs du backend
   - Vérifiez que la commande est créée automatiquement

## Avantages de cette approche

- ✅ **Sécurité** : Validation des webhooks avec signature Stripe
- ✅ **Fiabilité** : Stripe gère la logique de paiement
- ✅ **Simplicité** : Pas de gestion manuelle des cartes bancaires
- ✅ **Conformité** : Respect des standards PCI DSS
- ✅ **Maintenance** : Moins de code à maintenir côté client
