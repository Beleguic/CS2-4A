const privacyService = require('../services/privacyService');
const { User } = require('../models');

class PrivacyController {
  /**
   * Obtenir les préférences de confidentialité de l'utilisateur connecté
   */
  async getUserPreferences(req, res) {
    try {
      const userId = req.userData.userId;
      const preferences = await privacyService.getUserPreferences(userId);
      const summary = privacyService.getPreferencesSummary(preferences);

      res.json({
        success: true,
        preferences: summary,
        raw: preferences
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des préférences:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des préférences de confidentialité',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Mettre à jour les préférences de confidentialité
   */
  async updateUserPreferences(req, res) {
    try {
      const userId = req.userData.userId;
      const updates = req.body;

      // Validation des données
      const validation = privacyService.validatePreferencesUpdate(updates);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Données de préférences invalides',
          details: validation.errors
        });
      }

      const preferences = await privacyService.updateUserPreferences(userId, updates);
      const summary = privacyService.getPreferencesSummary(preferences);

      res.json({
        success: true,
        message: 'Préférences de confidentialité mises à jour avec succès',
        preferences: summary
      });

    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des préférences:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la mise à jour des préférences de confidentialité',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Appliquer un niveau de confidentialité prédéfini
   */
  async applyPrivacyLevel(req, res) {
    try {
      const userId = req.userData.userId;
      const { privacyLevel } = req.body;

      if (!privacyLevel || !['strict', 'moderate', 'permissive'].includes(privacyLevel)) {
        return res.status(400).json({
          error: 'Niveau de confidentialité invalide. Doit être strict, moderate ou permissive'
        });
      }

      const preferences = await privacyService.applyPrivacyLevel(userId, privacyLevel);
      const summary = privacyService.getPreferencesSummary(preferences);

      res.json({
        success: true,
        message: `Niveau de confidentialité ${privacyLevel} appliqué avec succès`,
        preferences: summary
      });

    } catch (error) {
      console.error('❌ Erreur lors de l\'application du niveau de confidentialité:', error);
      res.status(500).json({ 
        error: 'Erreur lors de l\'application du niveau de confidentialité',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Réinitialiser les préférences aux valeurs par défaut
   */
  async resetPreferences(req, res) {
    try {
      const userId = req.userData.userId;
      const { privacyLevel = 'moderate' } = req.body;

      const preferences = await privacyService.applyPrivacyLevel(userId, privacyLevel);
      const summary = privacyService.getPreferencesSummary(preferences);

      res.json({
        success: true,
        message: 'Préférences réinitialisées aux valeurs par défaut',
        preferences: summary
      });

    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation des préférences:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la réinitialisation des préférences',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Vérifier les permissions de marketing
   */
  async checkMarketingPermissions(req, res) {
    try {
      const userId = req.userData.userId;
      const { type = 'email' } = req.query;

      const canReceive = await privacyService.canReceiveMarketing(userId, type);

      res.json({
        success: true,
        canReceive,
        type
      });

    } catch (error) {
      console.error('❌ Erreur lors de la vérification des permissions marketing:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la vérification des permissions marketing',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Vérifier les permissions d'analytics
   */
  async checkAnalyticsPermissions(req, res) {
    try {
      const userId = req.userData.userId;
      const canTrack = await privacyService.canTrackAnalytics(userId);

      res.json({
        success: true,
        canTrack
      });

    } catch (error) {
      console.error('❌ Erreur lors de la vérification des permissions analytics:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la vérification des permissions analytics',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Vérifier les permissions de personnalisation
   */
  async checkPersonalizationPermissions(req, res) {
    try {
      const userId = req.userData.userId;
      const canPersonalize = await privacyService.canPersonalize(userId);

      res.json({
        success: true,
        canPersonalize
      });

    } catch (error) {
      console.error('❌ Erreur lors de la vérification des permissions de personnalisation:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la vérification des permissions de personnalisation',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtenir la visibilité du profil
   */
  async getProfileVisibility(req, res) {
    try {
      const userId = req.userData.userId;
      const visibility = await privacyService.getProfileVisibility(userId);

      res.json({
        success: true,
        visibility
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la visibilité du profil:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération de la visibilité du profil',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtenir les statistiques de confidentialité (admin)
   */
  async getPrivacyStats(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const stats = await privacyService.getPrivacyStats();

      res.json({
        success: true,
        stats
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques de confidentialité:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des statistiques de confidentialité',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Nettoyer les préférences expirées (admin)
   */
  async cleanupExpiredPreferences(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const result = await privacyService.cleanupExpiredPreferences();

      res.json({
        success: true,
        message: `Nettoyage terminé: ${result.cleaned} préférences expirées traitées`,
        result
      });

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des préférences expirées:', error);
      res.status(500).json({ 
        error: 'Erreur lors du nettoyage des préférences expirées',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtenir les préférences d'un utilisateur spécifique (admin)
   */
  async getUserPreferencesById(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const { userId } = req.params;
      
      // Vérifier que l'utilisateur existe
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          error: 'Utilisateur non trouvé'
        });
      }

      const preferences = await privacyService.getUserPreferences(userId);
      const summary = privacyService.getPreferencesSummary(preferences);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        preferences: summary,
        raw: preferences
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des préférences utilisateur:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des préférences utilisateur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Mettre à jour les préférences d'un utilisateur spécifique (admin)
   */
  async updateUserPreferencesById(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const { userId } = req.params;
      const updates = req.body;

      // Vérifier que l'utilisateur existe
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          error: 'Utilisateur non trouvé'
        });
      }

      // Validation des données
      const validation = privacyService.validatePreferencesUpdate(updates);
      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Données de préférences invalides',
          details: validation.errors
        });
      }

      const preferences = await privacyService.updateUserPreferences(userId, updates);
      const summary = privacyService.getPreferencesSummary(preferences);

      res.json({
        success: true,
        message: 'Préférences de confidentialité mises à jour avec succès',
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        preferences: summary
      });

    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des préférences utilisateur:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la mise à jour des préférences utilisateur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtenir la documentation des préférences
   */
  async getPrivacyDocumentation(req, res) {
    try {
      const documentation = {
        title: 'Documentation des Préférences de Confidentialité - Tropicool',
        version: '1.0',
        description: 'Guide complet des préférences de confidentialité et de leur impact',
        
        privacyLevels: {
          strict: {
            name: 'Strict',
            description: 'Protection maximale de la vie privée',
            features: [
              'Cookies essentiels uniquement',
              'Aucun marketing',
              'Aucun tracking',
              'Profil privé',
              'Rétention courte (30 jours)',
              'Suppression automatique'
            ]
          },
          moderate: {
            name: 'Modéré',
            description: 'Équilibre entre fonctionnalités et confidentialité',
            features: [
              'Cookies essentiels et analytics',
              'Marketing optionnel',
              'Tracking limité',
              'Profil configurable',
              'Rétention standard (1 an)',
              'Suppression automatique'
            ]
          },
          permissive: {
            name: 'Permissif',
            description: 'Fonctionnalités maximales',
            features: [
              'Tous les cookies',
              'Marketing complet',
              'Tracking complet',
              'Profil public',
              'Rétention longue (3 ans)',
              'Pas de suppression automatique'
            ]
          }
        },

        categories: {
          marketing: {
            title: 'Marketing et Communications',
            description: 'Contrôle des communications marketing',
            settings: [
              'receive_email_marketing',
              'receive_sms_marketing',
              'receive_push_notifications',
              'receive_newsletter'
            ]
          },
          tracking: {
            title: 'Tracking et Analytics',
            description: 'Contrôle du suivi et de l\'analyse',
            settings: [
              'accept_analytics_cookies',
              'accept_marketing_cookies',
              'accept_third_party_cookies',
              'share_data_analytics'
            ]
          },
          profile: {
            title: 'Visibilité du Profil',
            description: 'Contrôle de la visibilité des informations personnelles',
            settings: [
              'profile_visibility',
              'show_email_public',
              'show_phone_public',
              'show_address_public'
            ]
          },
          personalization: {
            title: 'Personnalisation',
            description: 'Contrôle de la personnalisation du contenu',
            settings: [
              'allow_personalization',
              'allow_recommendations',
              'allow_targeted_ads'
            ]
          },
          dataRetention: {
            title: 'Rétention des Données',
            description: 'Contrôle de la durée de conservation des données',
            settings: [
              'data_retention_period',
              'auto_delete_inactive'
            ]
          }
        },

        api: {
          endpoints: [
            {
              method: 'GET',
              path: '/api/privacy/preferences',
              description: 'Obtenir ses préférences de confidentialité',
              auth: 'Utilisateur connecté'
            },
            {
              method: 'PUT',
              path: '/api/privacy/preferences',
              description: 'Mettre à jour ses préférences de confidentialité',
              auth: 'Utilisateur connecté'
            },
            {
              method: 'POST',
              path: '/api/privacy/level',
              description: 'Appliquer un niveau de confidentialité prédéfini',
              auth: 'Utilisateur connecté'
            },
            {
              method: 'POST',
              path: '/api/privacy/reset',
              description: 'Réinitialiser les préférences aux valeurs par défaut',
              auth: 'Utilisateur connecté'
            },
            {
              method: 'GET',
              path: '/api/privacy/marketing',
              description: 'Vérifier les permissions marketing',
              auth: 'Utilisateur connecté'
            },
            {
              method: 'GET',
              path: '/api/privacy/analytics',
              description: 'Vérifier les permissions analytics',
              auth: 'Utilisateur connecté'
            },
            {
              method: 'GET',
              path: '/api/privacy/personalization',
              description: 'Vérifier les permissions de personnalisation',
              auth: 'Utilisateur connecté'
            },
            {
              method: 'GET',
              path: '/api/privacy/profile-visibility',
              description: 'Obtenir la visibilité du profil',
              auth: 'Utilisateur connecté'
            },
            {
              method: 'GET',
              path: '/api/privacy/stats',
              description: 'Obtenir les statistiques de confidentialité',
              auth: 'Admin uniquement'
            },
            {
              method: 'POST',
              path: '/api/privacy/cleanup',
              description: 'Nettoyer les préférences expirées',
              auth: 'Admin uniquement'
            }
          ]
        },

        compliance: {
          rgpd: [
            'Droit à l\'information transparente',
            'Droit de consentement explicite',
            'Droit de retrait du consentement',
            'Droit à la portabilité des données',
            'Droit à l\'effacement',
            'Droit à la limitation du traitement'
          ],
          cnil: [
            'Respect des principes de minimisation',
            'Base légale du consentement',
            'Durée de conservation limitée',
            'Sécurité des données',
            'Transparence des traitements'
          ]
        }
      };

      res.json({
        success: true,
        documentation: documentation
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la documentation:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération de la documentation',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new PrivacyController(); 