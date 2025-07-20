# 🔧 Corrections Configuration Variables d'Environnement

## 📋 Problème Identifié

Le backend et le frontend ne chargeaient pas correctement les variables d'environnement depuis le fichier `.env` de la racine du projet, causant des erreurs de configuration.

## ✅ Corrections Apportées

### **1. Backend API (backend/server.js)**
```javascript
// AVANT
require('dotenv').config();

// APRÈS
require('dotenv').config({ path: '../.env' });
```

### **2. Service Poste (poste/server.js)**
```javascript
// AVANT
require('dotenv').config();

// APRÈS
require('dotenv').config({ path: '../.env' });
```

### **3. Modèle Livraison (poste/models/livraison.js)**
```javascript
// AVANT
require('dotenv').config();

// APRÈS
require('dotenv').config({ path: '../../.env' });
```

### **4. Contrôleur Auth (backend/controllers/authController.js)**
```javascript
// AVANT
require('dotenv').config();

// APRÈS
require('dotenv').config({ path: '../.env' });
```

### **5. Frontend Vite (tropicool/vite.config.ts)**
```typescript
// AVANT
export default defineConfig({
  // Configuration simple
});

// APRÈS
export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement depuis la racine du projet
  const env = loadEnv(mode, '../', '')
  
  return {
    // Configuration avec variables d'environnement
    define: {
      'process.env': env
    }
  }
});
```

## 🛠️ Outils Ajoutés

### **1. Script de Test (test-env.js)**
```bash
# Tester la configuration des variables d'environnement
npm run test-env
# ou
node test-env.js
```

**Fonctionnalités du script :**
- ✅ Vérification de l'existence du fichier `.env`
- ✅ Validation des variables critiques
- ✅ Masquage des valeurs sensibles
- ✅ Vérification de la sécurité (longueur des clés)
- ✅ Validation des formats d'URL
- ✅ Rapport détaillé avec instructions

### **2. Package.json Racine**
```json
{
  "scripts": {
    "test-env": "node test-env.js",
    "check-env": "node test-env.js",
    "generate-secrets": "node -e \"console.log('JWT_SECRET:', require('crypto').randomBytes(32).toString('hex')); console.log('SESSION_SECRET:', require('crypto').randomBytes(32).toString('hex'));\"",
    "start": "docker-compose up -d",
    "stop": "docker-compose down",
    "restart": "docker-compose restart",
    "logs": "docker-compose logs -f",
    "build": "docker-compose build",
    "clean": "docker-compose down -v",
    "dev": "docker-compose up",
    "setup": "cp env.example .env && echo 'Fichier .env créé. Veuillez le configurer.'"
  }
}
```

## 🚀 Installation et Configuration

### **1. Installation Rapide**
```bash
# 1. Copier le fichier d'environnement
npm run setup
# ou
cp env.example .env

# 2. Éditer le fichier .env
nano .env

# 3. Tester la configuration
npm run test-env

# 4. Démarrer le projet
npm start
```

### **2. Génération de Clés Sécurisées**
```bash
# Générer JWT_SECRET et SESSION_SECRET
npm run generate-secrets
```

### **3. Vérification de la Configuration**
```bash
# Tester toutes les variables
npm run test-env

# Voir les logs en temps réel
npm run logs

# Redémarrer les services
npm run restart
```

## 📊 Variables Vérifiées par le Script

### **Variables Critiques**
- `NODE_ENV` - Environnement d'exécution
- `PORT` - Port du backend API
- `PORT_POSTE` - Port du service Poste
- `MONGO_URL` - URL MongoDB
- `DATABASE_URL` - URL PostgreSQL Backend
- `DATABASE_URL_POSTE` - URL PostgreSQL Poste
- `JWT_SECRET` - Clé secrète JWT
- `SESSION_SECRET` - Clé secrète des sessions
- `ALLOWED_ORIGINS` - Origines CORS autorisées
- `SMTP_HOST` - Serveur SMTP
- `SMTP_USER` - Utilisateur SMTP
- `FRONTEND_URL` - URL du frontend
- `VITE_API_URL` - URL de l'API (Frontend)
- `VITE_POSTE_API_URL` - URL de l'API Poste (Frontend)
- `STRIPE_SECRET_KEY` - Clé secrète Stripe
- `STRIPE_PUBLISHABLE_KEY` - Clé publique Stripe
- `VITE_STRIPE_PUBLISHABLE_KEY` - Clé publique Stripe (Frontend)

### **Vérifications de Sécurité**
- ✅ Longueur minimale des clés secrètes (32 caractères)
- ✅ Format correct des URLs
- ✅ Présence de toutes les variables critiques

## 🔍 Test de Fonctionnement

### **1. Test du Backend**
```bash
# Vérifier que le backend charge les variables
curl http://localhost:3000/health
```

### **2. Test du Service Poste**
```bash
# Vérifier que le service Poste charge les variables
curl http://localhost:3001/health
```

### **3. Test du Frontend**
```bash
# Vérifier que le frontend charge les variables
curl http://localhost:8000
```

## 🐳 Docker Compose

Le `docker-compose.yml` a été mis à jour pour utiliser les variables d'environnement du fichier `.env` de la racine :

```yaml
services:
  node:
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      PORT: ${PORT:-3000}
      MONGO_URL: ${MONGO_URL}
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      SESSION_SECRET: ${SESSION_SECRET}
      # ... autres variables

  poste:
    environment:
      NODE_ENV: ${NODE_ENV:-development}
      PORT: ${PORT_POSTE:-3001}
      DATABASE_URL_POSTE: ${DATABASE_URL_POSTE}
      JWT_SECRET: ${JWT_SECRET}
      SESSION_SECRET: ${SESSION_SECRET}
      # ... autres variables

  vue:
    environment:
      VITE_API_URL: ${VITE_API_URL}
      VITE_POSTE_API_URL: ${VITE_POSTE_API_URL}
      VITE_STRIPE_PUBLISHABLE_KEY: ${VITE_STRIPE_PUBLISHABLE_KEY}
      # ... autres variables Vite
```

## 🆘 Dépannage

### **Problèmes Courants**

#### **1. Variables non trouvées**
```bash
# Vérifier que le fichier .env existe
ls -la .env

# Tester la configuration
npm run test-env
```

#### **2. Erreurs de chemin**
```bash
# Vérifier la structure du projet
tree -L 2

# S'assurer que le fichier .env est à la racine
pwd && ls -la .env
```

#### **3. Variables non chargées**
```bash
# Vérifier les logs Docker
npm run logs

# Redémarrer les services
npm run restart
```

### **Commandes Utiles**
```bash
# Vérifier la configuration
npm run test-env

# Générer des clés sécurisées
npm run generate-secrets

# Voir les logs
npm run logs

# Redémarrer tout
npm run restart

# Nettoyer complètement
npm run clean
```

## ✅ Résultat

Maintenant, **tous les services** (Backend, Poste, Frontend) utilisent correctement le fichier `.env` de la racine du projet :

- 🔧 **Configuration unifiée** : Un seul fichier `.env` à la racine
- 🛠️ **Outils de test** : Script de vérification automatique
- 🐳 **Docker intégré** : Variables automatiquement récupérées
- 🔒 **Sécurité renforcée** : Validation des clés et formats
- 📚 **Documentation** : Instructions claires et détaillées

Le projet Tropicool est maintenant **entièrement configuré** pour utiliser le fichier `.env` de la racine ! 🎉 