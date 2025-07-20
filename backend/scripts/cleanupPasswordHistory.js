#!/usr/bin/env node

/**
 * Script de nettoyage automatique de l'historique des mots de passe
 * 
 * Ce script peut être exécuté via cron pour nettoyer automatiquement
 * l'historique des mots de passe en gardant seulement les 10 derniers.
 * 
 * Usage:
 * - Manuel: node scripts/cleanupPasswordHistory.js
 * - Cron: 0 2 * * 0 node /path/to/scripts/cleanupPasswordHistory.js (tous les dimanches à 2h)
 */

require('dotenv').config({ path: '../.env' });
const PasswordRotationService = require('../services/passwordRotationService');
const { sequelize } = require('../models');

async function cleanupPasswordHistory() {
    console.log('🔄 Début du nettoyage de l\'historique des mots de passe...');
    console.log(`⏰ ${new Date().toLocaleString('fr-FR')}`);
    
    try {
        // Vérifier la connexion à la base de données
        await sequelize.authenticate();
        console.log('✅ Connexion à la base de données établie');
        
        // Nettoyer l'historique pour tous les utilisateurs
        const cleanedCount = await PasswordRotationService.cleanupAllPasswordHistory(10);
        
        console.log(`✅ Nettoyage terminé pour ${cleanedCount} utilisateurs`);
        
        // Obtenir les statistiques de rotation
        const stats = await PasswordRotationService.getPasswordRotationStats();
        
        console.log(`📊 Statistiques de rotation des mots de passe:`);
        console.log(`   - Total utilisateurs: ${stats.totalUsers}`);
        console.log(`   - Mots de passe expirés: ${stats.usersWithExpiredPasswords} (${stats.expiredPercentage}%)`);
        console.log(`   - Mots de passe expirant bientôt: ${stats.usersWithExpiringPasswords} (${stats.expiringPercentage}%)`);
        console.log(`   - Changements forcés: ${stats.usersWithForceChange}`);
        
        console.log('✅ Nettoyage de l\'historique terminé avec succès');
        
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
    cleanupPasswordHistory()
        .then(() => {
            console.log('🎉 Script de nettoyage terminé');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Erreur fatale:', error);
            process.exit(1);
        });
}

module.exports = cleanupPasswordHistory; 