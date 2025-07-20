const { User, Newsletter, Alert, Order, Cart, PasswordHistory } = require('../models');
const { sequelize } = require('../models');
const denormalizationService = require('./denormalizationService');
const crypto = require('crypto');

class AnonymizationService {
  /**
   * Anonymiser complètement un utilisateur (conformité RGPD)
   */
  static async anonymizeUser(userId, reason = 'RGPD_REQUEST') {
    const transaction = await sequelize.transaction();
    
    try {
      console.log(`🔄 Début de l'anonymisation de l'utilisateur ${userId}`);
      
      // Récupérer l'utilisateur
      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Sauvegarder les données avant anonymisation pour audit
      const originalData = await this.backupUserData(userId, reason);
      
      // Anonymiser les données personnelles
      const anonymizedData = this.generateAnonymizedData();
      
      // Mettre à jour l'utilisateur avec des données anonymisées
      await user.update({
        email: `anonymized_${anonymizedData.hash}_${Date.now()}@deleted.local`,
        username: `user_${anonymizedData.hash}`,
        first_name: 'Utilisateur',
        last_name: 'Supprimé',
        date_of_birth: new Date('1900-01-01'),
        phone: null,
        address: null,
        city: null,
        postal_code: null,
        country: null,
        is_verified: false,
        verification_token: null,
        reset_password_token: null,
        reset_password_expires: null,
        password: await this.hashPassword('deleted_' + anonymizedData.hash),
        password_last_changed: new Date(),
        force_password_change: false,
        login_attempts: 0,
        lock_until: null,
        role: 'user',
        is_subscribed_to_newsletter: false,
        is_anonymized: true,
        anonymized_at: new Date(),
        anonymization_reason: reason,
        original_email_hash: this.hashEmail(user.email), // Pour éviter la réutilisation
        original_data_backup: JSON.stringify(originalData)
      }, { transaction });

      // Anonymiser les données associées
      await this.anonymizeAssociatedData(userId, anonymizedData, transaction);
      
      // Synchroniser vers MongoDB
      await denormalizationService.syncUser(userId);
      
      await transaction.commit();
      
      console.log(`✅ Utilisateur ${userId} anonymisé avec succès`);
      
      return {
        success: true,
        userId,
        anonymizedAt: new Date(),
        reason,
        anonymizedEmail: user.email,
        anonymizedUsername: user.username
      };
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erreur lors de l\'anonymisation:', error);
      throw error;
    }
  }

  /**
   * Anonymiser les données associées à l'utilisateur
   */
  static async anonymizeAssociatedData(userId, anonymizedData, transaction) {
    try {
      // Anonymiser les newsletters
      await Newsletter.update({
        email: `anonymized_${anonymizedData.hash}_${Date.now()}@deleted.local`
      }, {
        where: { user_id: userId },
        transaction
      });

      // Anonymiser les alertes
      await Alert.update({
        email: `anonymized_${anonymizedData.hash}_${Date.now()}@deleted.local`
      }, {
        where: { user_id: userId },
        transaction
      });

      // Anonymiser les commandes (garder les données de livraison pour la logistique)
      await Order.update({
        customer_email: `anonymized_${anonymizedData.hash}_${Date.now()}@deleted.local`,
        customer_name: 'Client Anonymisé',
        customer_phone: null,
        shipping_address: 'Adresse supprimée',
        billing_address: 'Adresse supprimée'
      }, {
        where: { user_id: userId },
        transaction
      });

      // Anonymiser les paniers
      await Cart.update({
        user_email: `anonymized_${anonymizedData.hash}_${Date.now()}@deleted.local`
      }, {
        where: { user_id: userId },
        transaction
      });

      // Supprimer l'historique des mots de passe
      await PasswordHistory.destroy({
        where: { user_id: userId },
        transaction
      });

      console.log(`✅ Données associées anonymisées pour l'utilisateur ${userId}`);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'anonymisation des données associées:', error);
      throw error;
    }
  }

  /**
   * Sauvegarder les données originales avant anonymisation
   */
  static async backupUserData(userId, reason) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé pour la sauvegarde');
      }

      const backup = {
        userId,
        originalData: {
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          dateOfBirth: user.date_of_birth,
          phone: user.phone,
          address: user.address,
          city: user.city,
          postalCode: user.postal_code,
          country: user.country,
          role: user.role,
          isSubscribedToNewsletter: user.is_subscribed_to_newsletter,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        },
        associatedData: {
          newsletters: await Newsletter.findAll({ where: { user_id: userId } }),
          alerts: await Alert.findAll({ where: { user_id: userId } }),
          orders: await Order.findAll({ where: { user_id: userId } }),
          carts: await Cart.findAll({ where: { user_id: userId } }),
          passwordHistory: await PasswordHistory.findAll({ where: { user_id: userId } })
        },
        backupInfo: {
          reason,
          backedUpAt: new Date(),
          backedUpBy: 'system'
        }
      };

      console.log(`📦 Sauvegarde des données originales pour l'utilisateur ${userId}`);
      return backup;
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des données:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un email a déjà été utilisé (pour éviter la réutilisation)
   */
  static async isEmailPreviouslyUsed(email) {
    try {
      const hashedEmail = this.hashEmail(email);
      
      const existingUser = await User.findOne({
        where: {
          original_email_hash: hashedEmail,
          is_anonymized: true
        }
      });

      return !!existingUser;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'email:', error);
      return false;
    }
  }

  /**
   * Permettre la recréation d'un compte avec les mêmes informations
   */
  static async allowAccountRecreation(email, username) {
    try {
      const hashedEmail = this.hashEmail(email);
      
      // Vérifier si un compte anonymisé existe avec cet email
      const anonymizedUser = await User.findOne({
        where: {
          original_email_hash: hashedEmail,
          is_anonymized: true
        }
      });

      if (anonymizedUser) {
        // Marquer que la recréation est autorisée
        await anonymizedUser.update({
          recreation_allowed: true,
          recreation_requested_at: new Date()
        });

        console.log(`✅ Recréation de compte autorisée pour ${email}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erreur lors de l\'autorisation de recréation:', error);
      return false;
    }
  }

  /**
   * Obtenir les statistiques d'anonymisation
   */
  static async getAnonymizationStats() {
    try {
      const totalUsers = await User.count();
      const anonymizedUsers = await User.count({
        where: { is_anonymized: true }
      });

      const recentAnonymizations = await User.count({
        where: {
          is_anonymized: true,
          anonymized_at: {
            [require('sequelize').Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
          }
        }
      });

      const recreationRequests = await User.count({
        where: {
          is_anonymized: true,
          recreation_allowed: true
        }
      });

      return {
        totalUsers,
        anonymizedUsers,
        recentAnonymizations,
        recreationRequests,
        anonymizationRate: totalUsers > 0 ? ((anonymizedUsers / totalUsers) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Générer des données anonymisées
   */
  static generateAnonymizedData() {
    const hash = crypto.randomBytes(16).toString('hex');
    return {
      hash,
      timestamp: Date.now()
    };
  }

  /**
   * Hasher un email de manière sécurisée
   */
  static hashEmail(email) {
    return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
  }

  /**
   * Hasher un mot de passe pour l'anonymisation
   */
  static async hashPassword(password) {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
  }

  /**
   * Vérifier si un utilisateur est anonymisé
   */
  static async isUserAnonymized(userId) {
    try {
      const user = await User.findByPk(userId);
      return user ? user.is_anonymized : false;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification d\'anonymisation:', error);
      return false;
    }
  }

  /**
   * Restaurer un compte anonymisé (admin seulement)
   */
  static async restoreAnonymizedUser(userId, newEmail, newUsername) {
    const transaction = await sequelize.transaction();
    
    try {
      const user = await User.findByPk(userId, { transaction });
      if (!user || !user.is_anonymized) {
        throw new Error('Utilisateur non trouvé ou non anonymisé');
      }

      // Vérifier que le nouvel email n'est pas déjà utilisé
      const existingUser = await User.findOne({
        where: { email: newEmail.toLowerCase().trim() },
        transaction
      });

      if (existingUser && existingUser.id !== userId) {
        throw new Error('Cet email est déjà utilisé par un autre compte');
      }

      // Restaurer les données originales si disponibles
      let originalData = {};
      if (user.original_data_backup) {
        try {
          originalData = JSON.parse(user.original_data_backup);
        } catch (e) {
          console.warn('Impossible de parser les données de sauvegarde');
        }
      }

      // Mettre à jour l'utilisateur
      await user.update({
        email: newEmail.toLowerCase().trim(),
        username: newUsername,
        first_name: originalData.originalData?.firstName || 'Utilisateur',
        last_name: originalData.originalData?.lastName || 'Restauré',
        date_of_birth: originalData.originalData?.dateOfBirth || new Date('1990-01-01'),
        is_verified: false,
        is_anonymized: false,
        anonymized_at: null,
        anonymization_reason: null,
        recreation_allowed: false,
        recreation_requested_at: null,
        force_password_change: true // Forcer le changement de mot de passe
      }, { transaction });

      await transaction.commit();
      
      console.log(`✅ Utilisateur ${userId} restauré avec succès`);
      
      return {
        success: true,
        userId,
        restoredAt: new Date(),
        newEmail,
        newUsername
      };
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erreur lors de la restauration:', error);
      throw error;
    }
  }
}

module.exports = AnonymizationService; 