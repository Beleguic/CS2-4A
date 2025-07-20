# 🥥 Tropicool - E-commerce Sécurisé

## 📋 Description

Tropicool est une plateforme e-commerce complète et sécurisée développée avec Vue.js, Node.js, MongoDB et PostgreSQL. Le projet inclut une authentification sécurisée, une gestion des stocks, des paiements Stripe, et un système de livraison intégré.

## 🏗️ Architecture

### **Services**
- **Frontend** : Vue.js 3 + TypeScript + Vite (Port 8000)
- **Backend API** : Node.js + Express + MongoDB + PostgreSQL (Port 3000)
- **Service Poste** : API de livraison (Port 3001)
- **Base de données** : MongoDB + PostgreSQL
- **Adminer** : Interface d'administration des bases de données (Port 8080)

### **Technologies**
- **Frontend** : Vue 3, TypeScript, Tailwind CSS, Pinia, Vue Router
- **Backend** : Node.js, Express, JWT, bcrypt, Sequelize, Mongoose
- **Base de données** : MongoDB, PostgreSQL
- **Paiements** : Stripe
- **Email** : Nodemailer
- **Sécurité** : Helmet, Rate Limiting, CORS, Validation Joi

## 🚀 Installation Rapide

### **1. Prérequis**
- Docker et Docker Compose
- Node.js 20+ (pour le développement local)

### **2. Configuration**
```bash
# Cloner le projet
git clone <repository-url>
cd vue

# Copier le fichier d'environnement
cp env.example .env

# Éditer le fichier .env avec vos valeurs
nano .env
```

### **3. Variables d'Environnement Critiques**
```env
# Générer des clés sécurisées
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
SESSION_SECRET=your-super-secret-session-key-change-in-production-minimum-32-characters

# Configuration email
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Clés Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

### **4. Démarrage**
```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

### **5. Accès**
- **Frontend** : http://localhost:8000
- **Backend API** : http://localhost:3000
- **Service Poste** : http://localhost:3001
- **Adminer** : http://localhost:8080

## 🔒 Sécurité

### **Mesures Implémentées**
- ✅ **Authentification JWT** avec validation stricte
- ✅ **Hachage bcrypt** des mots de passe
- ✅ **Rate Limiting** contre les attaques DDoS
- ✅ **CORS sécurisé** avec origines autorisées
- ✅ **Validation Joi** de toutes les entrées
- ✅ **Headers de sécurité** avec Helmet
- ✅ **Sessions sécurisées** avec HttpOnly cookies
- ✅ **Vérification des rôles** et propriétaires
- ✅ **Logs de sécurité** sans données sensibles

### **Routes Sécurisées**
- 🔒 **64 routes protégées** avec authentification
- 🔒 **Vérification des rôles** (admin, store-keeper, compta, user)
- 🔒 **Isolation des données** utilisateur
- 🔒 **Protection contre les fuites de données**

## 📚 Documentation

### **Guides de Sécurité**
- [🔒 Améliorations de Sécurité](SECURITY_IMPROVEMENTS.md)
- [🔒 Corrections des Fuites de Données](DATA_LEAK_FIXES.md)
- [🔒 API Poste Sécurisée](POSTE_API_SECURITY.md)
- [🔧 Variables d'Environnement](ENVIRONMENT_VARIABLES.md)
- [💳 Configuration Stripe](STRIPE_SETUP.md)

### **Structure du Projet**
```
vue/
├── .env.example              # Variables d'environnement (UNIQUE)
├── docker-compose.yml        # Configuration Docker
├── backend/                  # API Backend
├── poste/                    # Service Poste
├── tropicool/               # Frontend Vue.js
└── docs/                    # Documentation
```

## 🛠️ Développement

### **Commandes Utiles**
```bash
# Générer des clés sécurisées
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Vérifier les services
docker-compose ps

# Logs en temps réel
docker-compose logs -f [service]

# Redémarrer un service
docker-compose restart [service]

# Arrêter tous les services
docker-compose down
```

### **Tests de Sécurité**
```bash
# Test d'accès non autorisé
curl -X GET http://localhost:3000/api/user/

# Test avec token invalide
curl -X GET http://localhost:3000/api/user/ \
  -H "Authorization: Bearer invalid-token"

# Test de propriétaire
curl -X GET http://localhost:3000/api/cart/user/123 \
  -H "Authorization: Bearer user-456-token"
```

## 🚀 Production

### **Configuration Production**
1. **Modifier le fichier `.env`** :
   ```env
   NODE_ENV=production
   ALLOWED_ORIGINS=https://yourdomain.com
   FRONTEND_URL=https://yourdomain.com
   VITE_API_URL=https://api.yourdomain.com
   SMTP_SECURE=true
   ```

2. **Générer des clés de production** :
   ```bash
   # JWT Secret (64 caractères minimum)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Session Secret (64 caractères minimum)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Configurer HTTPS** et **limiter les origines CORS**

### **Variables Critiques Production**
- 🔑 **JWT_SECRET** : Clé de production sécurisée
- 🔑 **SESSION_SECRET** : Clé de session sécurisée
- 🔑 **STRIPE_SECRET_KEY** : Clé Stripe de production
- 🔑 **SMTP_PASSWORD** : Mot de passe email sécurisé
- 🌐 **ALLOWED_ORIGINS** : Origines HTTPS uniquement

## 📊 Fonctionnalités

### **Authentification**
- ✅ Inscription avec confirmation email
- ✅ Connexion sécurisée JWT
- ✅ Réinitialisation de mot de passe
- ✅ Vérification de compte
- ✅ Gestion des rôles (admin, store-keeper, compta, user)

### **E-commerce**
- ✅ Catalogue de produits
- ✅ Panier avec réservation (15min)
- ✅ Paiements Stripe sécurisés
- ✅ Gestion des commandes
- ✅ Historique des achats

### **Administration**
- ✅ Dashboard avec datavisualisation
- ✅ Gestion des stocks
- ✅ Gestion des utilisateurs
- ✅ Gestion des promotions
- ✅ Système d'alertes

### **Livraison**
- ✅ API La Poste intégrée
- ✅ Points relais
- ✅ Suivi des livraisons
- ✅ Géolocalisation

## 🆘 Dépannage

### **Problèmes Courants**
1. **Variables d'environnement manquantes** → Vérifier le fichier `.env`
2. **Connexion base de données** → Vérifier les services Docker
3. **Erreurs CORS** → Vérifier `ALLOWED_ORIGINS`
4. **Erreurs JWT** → Vérifier `JWT_SECRET`

### **Logs et Debugging**
```bash
# Logs complets
docker-compose logs

# Logs d'un service spécifique
docker-compose logs backend

# Logs en temps réel
docker-compose logs -f

# Vérifier l'état des services
docker-compose ps
```

## 🤝 Contribution

1. **Fork** le projet
2. **Créer** une branche feature
3. **Commit** vos changements
4. **Push** vers la branche
5. **Ouvrir** une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🔗 Liens Utiles

- [Documentation Vue.js](https://vuejs.org/)
- [Documentation Express](https://expressjs.com/)
- [Documentation Stripe](https://stripe.com/docs)
- [Documentation Docker](https://docs.docker.com/)

---

**⚠️ IMPORTANT** : Changez TOUTES les clés secrètes en production et ne committez JAMAIS le fichier `.env` réel !
   


      
   
