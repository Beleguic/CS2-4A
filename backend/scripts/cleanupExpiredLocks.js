#!/usr/bin/env node

/**
 * Script de nettoyage automatique des verrouillages expirés
 * 
 * Ce script peut être exécuté via cron pour nettoyer automatiquement
 * les verrouillages de comptes qui ont expiré.
 * 
 * Usage:
 * - Manuel: node scripts/cleanupExpiredLocks.js
 * - Cron: 0 */6 * * * node /path/to/scripts/cleanupExpiredLocks.js
 */

require('dotenv').config({ path: '../.env' });
const LoginAttemptService = require('../services/loginAttemptService');
const { sequelize } = require('../models');

async function cleanupExpiredLocks() {
    console.log('🔄 Début du nettoyage des verrouillages expirés...');
    console.log(`⏰ ${new Date().toLocaleString('fr-FR')}`);
    
    try {
        // Vérifier la connexion à la base de données
        await sequelize.authenticate();
        console.log('✅ Connexion à la base de données établie');
        
        // Nettoyer les verrouillages expirés
        const cleanedCount = await LoginAttemptService.cleanupExpiredLocks();
        
        if (cleanedCount > 0) {
            console.log(`✅ ${cleanedCount} verrouillages expirés nettoyés avec succès`);
        } else {
            console.log('ℹ️ Aucun verrouillage expiré à nettoyer');
        }
        
        // Obtenir les statistiques actuelles
        const stats = await LoginAttemptService.getLoginAttemptStats();
        const lockedAccounts = stats.filter(user => user.isLocked).length;
        
        console.log(`📊 Statistiques actuelles:`);
        console.log(`   - Comptes verrouillés: ${lockedAccounts}`);
        console.log(`   - Total utilisateurs avec tentatives: ${stats.length}`);
        
        if (lockedAccounts > 0) {
            console.log('🔒 Comptes actuellement verrouillés:');
            stats.filter(user => user.isLocked).forEach(user => {
                const remainingTime = user.remainingTime;
                console.log(`   - ${user.email}: ${remainingTime} minutes restantes`);
            });
        }
        
        console.log('✅ Nettoyage terminé avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors du nettoyage:', error);
        process.exit(1);
    } finally {
        // Fermer la connexion à la base de données
        await sequelize.close();
        console.log('🔌 Connexion à la base de données fermée');
    }
}

// Exécuter le script si appelé directement
if (require.main === module) {
    cleanupExpiredLocks()
        .then(() => {
            console.log('🎉 Script de nettoyage terminé');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Erreur fatale:', error);
            process.exit(1);
        });
}

module.exports = cleanupExpiredLocks; 