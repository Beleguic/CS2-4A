#!/usr/bin/env node

/**
 * Script de test pour vérifier le chargement des variables d'environnement
 * depuis le fichier .env de la racine du projet
 */

const path = require('path');
const fs = require('fs');

console.log('🔍 Test de chargement des variables d\'environnement\n');

// Vérifier l'existence du fichier .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
    console.log('❌ Fichier .env non trouvé à la racine du projet');
    console.log('📝 Créez le fichier avec : cp env.example .env');
    process.exit(1);
}

console.log('✅ Fichier .env trouvé à la racine');

// Charger les variables d'environnement
require('dotenv').config({ path: envPath });

// Variables critiques à vérifier
const criticalVars = [
    'NODE_ENV',
    'PORT',
    'PORT_POSTE',
    'MONGO_URL',
    'DATABASE_URL',
    'DATABASE_URL_POSTE',
    'JWT_SECRET',
    'SESSION_SECRET',
    'ALLOWED_ORIGINS',
    'SMTP_HOST',
    'SMTP_USER',
    'FRONTEND_URL',
    'VITE_API_URL',
    'VITE_POSTE_API_URL',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'VITE_STRIPE_PUBLISHABLE_KEY'
];

console.log('\n📋 Vérification des variables critiques :\n');

let allOk = true;

criticalVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        // Masquer les valeurs sensibles
        if (varName.includes('SECRET') || varName.includes('PASSWORD') || varName.includes('KEY')) {
            const maskedValue = value.length > 8 ? 
                value.substring(0, 4) + '***' + value.substring(value.length - 4) : 
                '***';
            console.log(`✅ ${varName}: ${maskedValue}`);
        } else {
            console.log(`✅ ${varName}: ${value}`);
        }
    } else {
        console.log(`❌ ${varName}: MANQUANTE`);
        allOk = false;
    }
});

// Vérifier les variables de sécurité
console.log('\n🔒 Vérification de la sécurité :\n');

const jwtSecret = process.env.JWT_SECRET;
if (jwtSecret && jwtSecret.length >= 32) {
    console.log('✅ JWT_SECRET: Longueur suffisante');
} else {
    console.log('❌ JWT_SECRET: Longueur insuffisante (minimum 32 caractères)');
    allOk = false;
}

const sessionSecret = process.env.SESSION_SECRET;
if (sessionSecret && sessionSecret.length >= 32) {
    console.log('✅ SESSION_SECRET: Longueur suffisante');
} else {
    console.log('❌ SESSION_SECRET: Longueur insuffisante (minimum 32 caractères)');
    allOk = false;
}

// Vérifier les URLs
console.log('\n🌐 Vérification des URLs :\n');

const frontendUrl = process.env.FRONTEND_URL;
if (frontendUrl && frontendUrl.startsWith('http')) {
    console.log('✅ FRONTEND_URL: Format correct');
} else {
    console.log('❌ FRONTEND_URL: Format incorrect ou manquant');
    allOk = false;
}

const apiUrl = process.env.VITE_API_URL;
if (apiUrl && apiUrl.startsWith('http')) {
    console.log('✅ VITE_API_URL: Format correct');
} else {
    console.log('❌ VITE_API_URL: Format incorrect ou manquant');
    allOk = false;
}

const posteUrl = process.env.VITE_POSTE_API_URL;
if (posteUrl && posteUrl.startsWith('http')) {
    console.log('✅ VITE_POSTE_API_URL: Format correct');
} else {
    console.log('❌ VITE_POSTE_API_URL: Format incorrect ou manquant');
    allOk = false;
}

// Résultat final
console.log('\n' + '='.repeat(50));
if (allOk) {
    console.log('🎉 TOUTES LES VARIABLES SONT CORRECTEMENT CONFIGURÉES !');
    console.log('✅ Le projet est prêt à être démarré');
} else {
    console.log('⚠️  CERTAINES VARIABLES NÉCESSITENT UNE ATTENTION');
    console.log('📝 Vérifiez le fichier .env et les variables manquantes');
}
console.log('='.repeat(50));

// Instructions
console.log('\n📚 Instructions :');
console.log('1. Vérifiez que toutes les variables sont définies');
console.log('2. Générez des clés sécurisées si nécessaire :');
console.log('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
console.log('3. Configurez vos clés Stripe et SMTP');
console.log('4. Démarrez le projet : docker-compose up -d');

process.exit(allOk ? 0 : 1); 