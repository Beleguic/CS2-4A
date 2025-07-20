# 🔧 Variables d'Environnement - Projet Tropicool

## 📋 Vue d'Ensemble

Ce document détaille toutes les variables d'environnement nécessaires pour faire fonctionner le projet Tropicool. Le projet utilise **3 services principaux** :

1. **Backend API** (Node.js + Express)
2. **Service Poste** (Node.js + Express)
3. **Frontend Vue.js** (Vite + TypeScript)

## 🗂️ Structure des Fichiers

```
vue/
├── env.example                    # Variables globales
├── backend/
│   └── env.example               # Variables Backend API
├── poste/
│   └── env.example               # Variables Service Poste
└── tropicool/
    └── env.example               # Variables Frontend Vue.js
```

## 🔑 Variables d'Environnement par Service

### **1. Backend API (Port 3000)**

#### **Environnement Général**
```env
NODE_ENV=development
PORT=3000
```

#### **Base de Données**
```env
# MongoDB
MONGO_URL=mongodb://root:password@localhost:27018/app?authSource=admin

# PostgreSQL
DATABASE_URL=postgres://root:password@localhost:5432/app
```

#### **Sécurité et Authentification**
```env
# JWT (JSON Web Tokens) - MINIMUM 32 CARACTÈRES
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters

# Sessions Express - MINIMUM 32 CARACTÈRES
SESSION_SECRET=your-super-secret-session-key-change-in-production-minimum-32-characters
```

#### **CORS et Origines Autorisées**
```env
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3000,http://localhost:5174
```

#### **Email et SMTP**
```env
# Configuration SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# URL Frontend pour les liens d'email
FRONTEND_URL=http://localhost:8000
```

#### **Stripe (Paiements)**
```env
# Clés Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# URLs de redirection Stripe
STRIPE_SUCCESS_URL=http://localhost:8000/confirmation
STRIPE_CANCEL_URL=http://localhost:8000/cart
```

#### **Logging et Monitoring**
```env
# Logs de sécurité
SECURITY_LOGGING=true

# Logs détaillés en développement
DEBUG_LOGGING=true
```

#### **Configuration Optionnelle**
```env
# Limite de taille des fichiers upload (en bytes)
MAX_FILE_SIZE=5242880

# Limite de requêtes par minute (Rate Limiting)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Timeout des sessions (en millisecondes)
SESSION_TIMEOUT=86400000
```

### **2. Service Poste (Port 3001)**

#### **Environnement Général**
```env
NODE_ENV=development
PORT=3001
```

#### **Base de Données**
```env
# PostgreSQL (Service Poste)
DATABASE_URL_POSTE=postgres://root:password@localhost:5432/poste
```

#### **Sécurité et Authentification**
```env
# JWT (JSON Web Tokens) - MINIMUM 32 CARACTÈRES
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters

# Sessions Express - MINIMUM 32 CARACTÈRES
SESSION_SECRET=your-super-secret-session-key-change-in-production-minimum-32-characters
```

#### **CORS et Origines Autorisées**
```env
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3000,http://localhost:5174
```

#### **Logging et Monitoring**
```env
# Logs de sécurité
SECURITY_LOGGING=true

# Logs détaillés en développement
DEBUG_LOGGING=true
```

#### **Configuration Optionnelle**
```env
# Limite de requêtes par minute (Rate Limiting)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Timeout des sessions (en millisecondes)
SESSION_TIMEOUT=86400000
```

### **3. Frontend Vue.js (Port 8000)**

#### **Environnement Général**
```env
NODE_ENV=development
VITE_NODE_ENV=development
```

#### **URLs des APIs**
```env
# URL de l'API Backend principal
VITE_API_URL=http://localhost:3000

# URL de l'API Service Poste
VITE_POSTE_API_URL=http://localhost:3001
```

#### **Stripe (Paiements)**
```env
# Clé publique Stripe (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# URLs de redirection Stripe
VITE_STRIPE_SUCCESS_URL=http://localhost:8000/confirmation
VITE_STRIPE_CANCEL_URL=http://localhost:8000/cart
```

#### **Configuration Développement**
```env
# Mode développement Vite
VITE_DEV_MODE=true

# Port de développement
VITE_PORT=5174

# Host de développement
VITE_HOST=0.0.0.0
```

#### **Configuration Optionnelle**
```env
# Debug mode
VITE_DEBUG=true

# Logs détaillés
VITE_VERBOSE_LOGS=true
```

## 🐳 Configuration Docker

### **Variables Docker Compose**
```env
# MongoDB Docker
MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=password

# PostgreSQL Docker
POSTGRES_USER=root
POSTGRES_PASSWORD=password
POSTGRES_DB=app
POSTGRES_DB_POSTE=poste
```

## 🔒 Variables Sensibles

### **Variables CRITIQUES (À changer en production)**
```env
# JWT Secret - MINIMUM 32 CARACTÈRES
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters

# Session Secret - MINIMUM 32 CARACTÈRES
SESSION_SECRET=your-super-secret-session-key-change-in-production-minimum-32-characters

# Stripe Secret Key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# SMTP Password
SMTP_PASSWORD=your-app-password
```

### **Variables de Base de Données**
```env
# MongoDB
MONGO_URL=mongodb://root:password@localhost:27018/app?authSource=admin

# PostgreSQL Backend
DATABASE_URL=postgres://root:password@localhost:5432/app

# PostgreSQL Poste
DATABASE_URL_POSTE=postgres://root:password@localhost:5432/poste
```

## 🚀 Configuration Production

### **Variables à modifier pour la production**
```env
# Environnement
NODE_ENV=production

# URLs sécurisées
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://api.yourdomain.com
VITE_POSTE_API_URL=https://poste.yourdomain.com

# Clés de production
JWT_SECRET=your-production-jwt-secret-minimum-64-characters
SESSION_SECRET=your-production-session-secret-minimum-64-characters
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here

# SMTP sécurisé
SMTP_SECURE=true

# URLs de redirection production
STRIPE_SUCCESS_URL=https://yourdomain.com/confirmation
STRIPE_CANCEL_URL=https://yourdomain.com/cart
VITE_STRIPE_SUCCESS_URL=https://yourdomain.com/confirmation
VITE_STRIPE_CANCEL_URL=https://yourdomain.com/cart
```

## 🛠️ Installation et Configuration

### **1. Copier les fichiers d'exemple**
```bash
# Copier les fichiers d'exemple
cp env.example .env
cp backend/env.example backend/.env
cp poste/env.example poste/.env
cp tropicool/env.example tropicool/.env
```

### **2. Configurer les variables**
```bash
# Éditer chaque fichier .env avec vos valeurs
nano .env
nano backend/.env
nano poste/.env
nano tropicool/.env
```

### **3. Générer des clés sécurisées**
```bash
# Générer une clé JWT sécurisée
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Générer une clé de session sécurisée
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **4. Vérifier la configuration**
```bash
# Démarrer les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f
```

## 🔍 Vérification des Variables

### **Script de vérification (optionnel)**
```javascript
// scripts/check-env.js
const fs = require('fs');
const path = require('path');

const requiredVars = {
  backend: ['NODE_ENV', 'PORT', 'MONGO_URL', 'DATABASE_URL', 'JWT_SECRET', 'SESSION_SECRET'],
  poste: ['NODE_ENV', 'PORT', 'DATABASE_URL_POSTE', 'JWT_SECRET', 'SESSION_SECRET'],
  frontend: ['VITE_API_URL', 'VITE_POSTE_API_URL']
};

function checkEnvFile(service, envPath) {
  if (!fs.existsSync(envPath)) {
    console.error(`❌ Fichier .env manquant pour ${service}: ${envPath}`);
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = envContent.split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('=')[0]);

  const missing = requiredVars[service].filter(varName => !envVars.includes(varName));
  
  if (missing.length > 0) {
    console.error(`❌ Variables manquantes pour ${service}: ${missing.join(', ')}`);
    return false;
  }

  console.log(`✅ Configuration ${service} OK`);
  return true;
}

// Vérifier tous les services
const services = ['backend', 'poste', 'frontend'];
let allOk = true;

services.forEach(service => {
  const envPath = path.join(__dirname, '..', service, '.env');
  if (!checkEnvFile(service, envPath)) {
    allOk = false;
  }
});

if (allOk) {
  console.log('\n🎉 Toutes les configurations sont correctes !');
} else {
  console.log('\n⚠️  Certaines configurations nécessitent une attention.');
  process.exit(1);
}
```

## 📝 Notes Importantes

### **Sécurité**
1. **Ne committez JAMAIS** les fichiers `.env` réels
2. **Changez TOUTES** les clés secrètes en production
3. **Utilisez HTTPS** en production
4. **Limitez les origines CORS** en production
5. **Activez les logs de sécurité** en production

### **Performance**
1. **Utilisez des secrets managers** en production
2. **Configurez des variables d'environnement sécurisées**
3. **Utilisez des mots de passe forts** pour les bases de données
4. **Activez la compression** en production

### **Maintenance**
1. **Audit régulier** des permissions
2. **Rotation des secrets** périodique
3. **Tests de pénétration** réguliers
4. **Mise à jour des dépendances** régulière

## 🆘 Dépannage

### **Problèmes Courants**

#### **1. Variables non trouvées**
```bash
# Vérifier que le fichier .env existe
ls -la .env

# Vérifier le contenu du fichier
cat .env
```

#### **2. Connexion base de données**
```bash
# Vérifier que les services Docker sont démarrés
docker-compose ps

# Vérifier les logs des bases de données
docker-compose logs mongo
docker-compose logs postgres
```

#### **3. CORS errors**
```bash
# Vérifier la configuration ALLOWED_ORIGINS
echo $ALLOWED_ORIGINS

# Vérifier que l'origine est incluse
grep "localhost:8000" .env
```

#### **4. JWT errors**
```bash
# Vérifier que JWT_SECRET est défini
grep "JWT_SECRET" .env

# Vérifier la longueur de la clé
node -e "console.log(process.env.JWT_SECRET?.length || 0)"
```

## 📚 Ressources

- [Documentation Node.js Environment Variables](https://nodejs.org/api/process.html#processenv)
- [Documentation Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Documentation Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)
- [Documentation Stripe Environment Variables](https://stripe.com/docs/keys)
- [Documentation SMTP Configuration](https://nodemailer.com/smtp/) 