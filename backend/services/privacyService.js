const UserPreferences = require('../models/userPreferences');
const { User } = require('../models');
const { sequelize } = require('../models/db');
const Joi = require('joi');

class PrivacyService {
  /**
   * Créer des préférences par défaut pour un utilisateur
   */
  async createDefaultPreferences(userId, privacyLevel = 'moderate') {
    try {
      // Vérifier si l'utilisateur existe
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier si des préférences existent déjà
      const existingPreferences = await UserPreferences.findOne({
        where: { user_id: userId }
      });

      if (existingPreferences) {
        throw new Error('Des préférences existent déjà pour cet utilisateur');
      }

      // Obtenir les préférences par défaut selon le niveau
      let defaultPrefs;
      switch (privacyLevel) {
        case 'strict':
          defaultPrefs = UserPreferences.getStrictPreferences();
          break;
        case 'permissive':
          defaultPrefs = this.getPermissivePreferences();
          break;
        default:
          defaultPrefs = UserPreferences.getDefaultPreferences();
      }

      // Créer les préférences avec consentement
      const preferences = await UserPreferences.create({
        user_id: userId,
        ...defaultPrefs,
        consent_given_at: new Date(),
        consent_version: '1.0'
      });

      console.log(`✅ Préférences de confidentialité créées pour l'utilisateur ${userId} (niveau: ${privacyLevel})`);
      
      return preferences;

    } catch (error) {
      console.error('❌ Erreur lors de la création des préférences par défaut:', error);
      throw error;
    }
  }

  /**
   * Obtenir les préférences d'un utilisateur
   */
  async getUserPreferences(userId) {
    try {
      let preferences = await UserPreferences.findOne({
        where: { user_id: userId }
      });

      // Si aucune préférence n'existe, créer des préférences par défaut
      if (!preferences) {
        preferences = await this.createDefaultPreferences(userId);
      }

      return preferences;

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des préférences:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour les préférences d'un utilisateur
   */
  async updateUserPreferences(userId, updates) {
    try {
      // Valider les données d'entrée
      const validation = this.validatePreferencesUpdate(updates);
      if (!validation.isValid) {
        throw new Error(`Données invalides: ${validation.errors.join(', ')}`);
      }

      let preferences = await UserPreferences.findOne({
        where: { user_id: userId }
      });

      // Si aucune préférence n'existe, créer des préférences par défaut
      if (!preferences) {
        preferences = await this.createDefaultPreferences(userId);
      }

      // Mettre à jour les préférences
      await preferences.update({
        ...updates,
        consent_given_at: new Date(),
        consent_version: '1.0'
      });

      console.log(`✅ Préférences de confidentialité mises à jour pour l'utilisateur ${userId}`);
      
      return preferences;

    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  }

  /**
   * Appliquer un niveau de confidentialité prédéfini
   */
  async applyPrivacyLevel(userId, privacyLevel) {
    try {
      let preferences = await UserPreferences.findOne({
        where: { user_id: userId }
      });

      if (!preferences) {
        return await this.createDefaultPreferences(userId, privacyLevel);
      }

      let newPrefs;
      switch (privacyLevel) {
        case 'strict':
          newPrefs = UserPreferences.getStrictPreferences();
          break;
        case 'permissive':
          newPrefs = this.getPermissivePreferences();
          break;
        default:
          newPrefs = UserPreferences.getDefaultPreferences();
      }

      await preferences.update({
        ...newPrefs,
        consent_given_at: new Date(),
        consent_version: '1.0'
      });

      console.log(`✅ Niveau de confidentialité ${privacyLevel} appliqué pour l'utilisateur ${userId}`);
      
      return preferences;

    } catch (error) {
      console.error('❌ Erreur lors de l\'application du niveau de confidentialité:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un utilisateur peut recevoir du marketing
   */
  async canReceiveMarketing(userId, type = 'email') {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      switch (type) {
        case 'email':
          return preferences.receive_email_marketing;
        case 'sms':
          return preferences.receive_sms_marketing;
        case 'push':
          return preferences.receive_push_notifications;
        case 'newsletter':
          return preferences.receive_newsletter;
        default:
          return preferences.canReceiveMarketing();
      }

    } catch (error) {
      console.error('❌ Erreur lors de la vérification des permissions marketing:', error);
      return false; // Par défaut, refuser
    }
  }

  /**
   * Vérifier si un utilisateur peut être tracé pour l'analytics
   */
  async canTrackAnalytics(userId) {
    try {
      const preferences = await this.getUserPreferences(userId);
      return preferences.canTrackAnalytics();

    } catch (error) {
      console.error('❌ Erreur lors de la vérification des permissions analytics:', error);
      return false; // Par défaut, refuser
    }
  }

  /**
   * Vérifier si un utilisateur peut recevoir du contenu personnalisé
   */
  async canPersonalize(userId) {
    try {
      const preferences = await this.getUserPreferences(userId);
      return preferences.canPersonalize();

    } catch (error) {
      console.error('❌ Erreur lors de la vérification des permissions de personnalisation:', error);
      return false; // Par défaut, refuser
    }
  }

  /**
   * Vérifier la visibilité du profil d'un utilisateur
   */
  async getProfileVisibility(userId) {
    try {
      const preferences = await this.getUserPreferences(userId);
      return {
        level: preferences.profile_visibility,
        showEmail: preferences.show_email_public,
        showPhone: preferences.show_phone_public,
        showAddress: preferences.show_address_public
      };

    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la visibilité du profil:', error);
      return {
        level: 'private',
        showEmail: false,
        showPhone: false,
        showAddress: false
      };
    }
  }

  /**
   * Obtenir les statistiques de confidentialité (admin)
   */
  async getPrivacyStats() {
    try {
      const stats = await UserPreferences.findAll({
        attributes: [
          'privacy_level',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['privacy_level']
      });

      const totalUsers = await User.count();
      const usersWithPreferences = await UserPreferences.count();

      return {
        totalUsers,
        usersWithPreferences,
        privacyLevels: stats.reduce((acc, stat) => {
          acc[stat.privacy_level] = parseInt(stat.dataValues.count);
          return acc;
        }, {}),
        coverage: (usersWithPreferences / totalUsers * 100).toFixed(2) + '%'
      };

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques de confidentialité:', error);
      throw error;
    }
  }

  /**
   * Nettoyer les préférences expirées
   */
  async cleanupExpiredPreferences() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 365); // 1 an

      const expiredPreferences = await UserPreferences.findAll({
        where: {
          consent_given_at: {
            [sequelize.Op.lt]: cutoffDate
          }
        }
      });

      let cleaned = 0;
      for (const pref of expiredPreferences) {
        // Réinitialiser aux préférences strictes par défaut
        await pref.update({
          ...UserPreferences.getStrictPreferences(),
          consent_given_at: new Date(),
          consent_version: '1.0'
        });
        cleaned++;
      }

      console.log(`🧹 ${cleaned} préférences expirées nettoyées`);
      return { cleaned };

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des préférences expirées:', error);
      throw error;
    }
  }

  /**
   * Valider les mises à jour de préférences
   */
  validatePreferencesUpdate(data) {
    const schema = Joi.object({
      privacy_level: Joi.string().valid('strict', 'moderate', 'permissive'),
      accept_essential_cookies: Joi.boolean(),
      accept_analytics_cookies: Joi.boolean(),
      accept_marketing_cookies: Joi.boolean(),
      accept_third_party_cookies: Joi.boolean(),
      receive_email_marketing: Joi.boolean(),
      receive_sms_marketing: Joi.boolean(),
      receive_push_notifications: Joi.boolean(),
      receive_newsletter: Joi.boolean(),
      share_data_analytics: Joi.boolean(),
      share_data_research: Joi.boolean(),
      share_data_partners: Joi.boolean(),
      profile_visibility: Joi.string().valid('public', 'friends', 'private'),
      show_email_public: Joi.boolean(),
      show_phone_public: Joi.boolean(),
      show_address_public: Joi.boolean(),
      save_search_history: Joi.boolean(),
      save_browsing_history: Joi.boolean(),
      save_purchase_history: Joi.boolean(),
      allow_location_tracking: Joi.boolean(),
      allow_location_services: Joi.boolean(),
      allow_personalization: Joi.boolean(),
      allow_recommendations: Joi.boolean(),
      allow_targeted_ads: Joi.boolean(),
      data_retention_period: Joi.string().valid('30_days', '90_days', '1_year', '3_years', 'indefinite'),
      auto_delete_inactive: Joi.boolean(),
      security_notifications: Joi.boolean(),
      privacy_notifications: Joi.boolean()
    }).options({ stripUnknown: true });

    const { error, value } = schema.validate(data);
    
    return {
      isValid: !error,
      errors: error ? error.details.map(detail => detail.message) : [],
      value
    };
  }

  /**
   * Obtenir les préférences permissives
   */
  getPermissivePreferences() {
    return {
      privacy_level: 'permissive',
      accept_essential_cookies: true,
      accept_analytics_cookies: true,
      accept_marketing_cookies: true,
      accept_third_party_cookies: true,
      receive_email_marketing: true,
      receive_sms_marketing: true,
      receive_push_notifications: true,
      receive_newsletter: true,
      share_data_analytics: true,
      share_data_research: true,
      share_data_partners: true,
      profile_visibility: 'public',
      show_email_public: true,
      show_phone_public: true,
      show_address_public: true,
      save_search_history: true,
      save_browsing_history: true,
      save_purchase_history: true,
      allow_location_tracking: true,
      allow_location_services: true,
      allow_personalization: true,
      allow_recommendations: true,
      allow_targeted_ads: true,
      data_retention_period: '3_years',
      auto_delete_inactive: false,
      security_notifications: true,
      privacy_notifications: true,
      consent_version: '1.0'
    };
  }

  /**
   * Obtenir un résumé des préférences pour l'affichage
   */
  getPreferencesSummary(preferences) {
    return {
      privacyLevel: preferences.privacy_level,
      marketing: {
        email: preferences.receive_email_marketing,
        sms: preferences.receive_sms_marketing,
        push: preferences.receive_push_notifications,
        newsletter: preferences.receive_newsletter
      },
      tracking: {
        analytics: preferences.accept_analytics_cookies,
        marketing: preferences.accept_marketing_cookies,
        thirdParty: preferences.accept_third_party_cookies
      },
      dataSharing: {
        analytics: preferences.share_data_analytics,
        research: preferences.share_data_research,
        partners: preferences.share_data_partners
      },
      profile: {
        visibility: preferences.profile_visibility,
        showEmail: preferences.show_email_public,
        showPhone: preferences.show_phone_public,
        showAddress: preferences.show_address_public
      },
      personalization: {
        enabled: preferences.allow_personalization,
        recommendations: preferences.allow_recommendations,
        targetedAds: preferences.allow_targeted_ads
      },
      dataRetention: {
        period: preferences.data_retention_period,
        autoDelete: preferences.auto_delete_inactive
      },
      lastUpdated: preferences.last_updated_at,
      consentGiven: preferences.consent_given_at
    };
  }
}

module.exports = new PrivacyService(); 