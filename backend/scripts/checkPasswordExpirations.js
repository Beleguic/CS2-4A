#!/usr/bin/env node

/**
 * Script de vérification automatique de l'expiration des mots de passe
 * 
 * Ce script peut être exécuté via cron pour vérifier automatiquement
 * l'expiration des mots de passe et envoyer les notifications appropriées.
 * 
 * Usage:
 * - Manuel: node scripts/checkPasswordExpirations.js
 * - Cron: 0 9 * * * node /path/to/scripts/checkPasswordExpirations.js (tous les jours à 9h)
 */

require('dotenv').config({ path: '../.env' });
const PasswordExpirationService = require('../services/passwordExpirationService');
const { sequelize } = require('../models');

async function checkPasswordExpirations() {
    console.log('🔄 Début de la vérification de l\'expiration des mots de passe...');
    console.log(`⏰ ${new Date().toLocaleString('fr-FR')}`);
    
    try {
        // Vérifier la connexion à la base de données
        await sequelize.authenticate();
        console.log('✅ Connexion à la base de données établie');
        
        // Vérifier et traiter l'expiration des mots de passe
        const result = await PasswordExpirationService.checkPasswordExpirations();
        
        console.log(`📊 Résultats de la vérification:`);
        console.log(`   - Mots de passe expirés: ${result.expiredCount}`);
        console.log(`   - Mots de passe expirant bientôt: ${result.expiringCount}`);
        console.log(`   - Total traité: ${result.totalProcessed}`);
        
        // Obtenir les statistiques d'expiration
        const stats = await PasswordExpirationService.getExpirationStats();
        
        console.log(`📈 Statistiques d'expiration des mots de passe:`);
        console.log(`   - Total utilisateurs: ${stats.totalUsers}`);
        console.log(`   - Mots de passe expirés: ${stats.expiredUsers} (${stats.expiredPercentage}%)`);
        console.log(`   - Mots de passe expirant bientôt: ${stats.expiringUsers} (${stats.expiringPercentage}%)`);
        console.log(`   - Changements forcés: ${stats.forcedChangeUsers} (${stats.forcedChangePercentage}%)`);
        console.log(`   - Mots de passe récents: ${stats.recentUsers} (${stats.recentPercentage}%)`);
        
        console.log('✅ Vérification de l\'expiration terminée avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error);
        process.exit(1);
    } finally {
        // Fermer la connexion à la base de données
        await sequelize.close();
        console.log('🔌 Connexion à la base de données fermée');
    }
}

// Exécuter le script si appelé directement
if (require.main === module) {
    checkPasswordExpirations()
        .then(() => {
            console.log('🎉 Script de vérification terminé');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Erreur fatale:', error);
            process.exit(1);
        });
}

module.exports = checkPasswordExpirations; 