const privacyService = require('../services/privacyService');

/**
 * Middleware pour respecter les préférences de confidentialité
 */
class PrivacyMiddleware {
  /**
   * Middleware pour vérifier les permissions marketing
   */
  static async checkMarketingPermissions(req, res, next) {
    try {
      // Si pas d'utilisateur connecté, continuer (gestion séparée)
      if (!req.userData || !req.userData.userId) {
        return next();
      }

      const userId = req.userData.userId;
      const type = req.query.type || 'email';
      
      const canReceive = await privacyService.canReceiveMarketing(userId, type);
      
      // Ajouter les permissions à la requête
      req.privacyPermissions = req.privacyPermissions || {};
      req.privacyPermissions.marketing = {
        canReceive,
        type,
        userId
      };

      next();

    } catch (error) {
      console.error('❌ Erreur dans le middleware de permissions marketing:', error);
      // En cas d'erreur, refuser par défaut
      req.privacyPermissions = req.privacyPermissions || {};
      req.privacyPermissions.marketing = {
        canReceive: false,
        type: req.query.type || 'email',
        userId: req.userData?.userId
      };
      next();
    }
  }

  /**
   * Middleware pour vérifier les permissions analytics
   */
  static async checkAnalyticsPermissions(req, res, next) {
    try {
      // Si pas d'utilisateur connecté, refuser par défaut
      if (!req.userData || !req.userData.userId) {
        req.privacyPermissions = req.privacyPermissions || {};
        req.privacyPermissions.analytics = { canTrack: false };
        return next();
      }

      const userId = req.userData.userId;
      const canTrack = await privacyService.canTrackAnalytics(userId);
      
      req.privacyPermissions = req.privacyPermissions || {};
      req.privacyPermissions.analytics = {
        canTrack,
        userId
      };

      next();

    } catch (error) {
      console.error('❌ Erreur dans le middleware de permissions analytics:', error);
      req.privacyPermissions = req.privacyPermissions || {};
      req.privacyPermissions.analytics = { canTrack: false };
      next();
    }
  }

  /**
   * Middleware pour vérifier les permissions de personnalisation
   */
  static async checkPersonalizationPermissions(req, res, next) {
    try {
      // Si pas d'utilisateur connecté, refuser par défaut
      if (!req.userData || !req.userData.userId) {
        req.privacyPermissions = req.privacyPermissions || {};
        req.privacyPermissions.personalization = { canPersonalize: false };
        return next();
      }

      const userId = req.userData.userId;
      const canPersonalize = await privacyService.canPersonalize(userId);
      
      req.privacyPermissions = req.privacyPermissions || {};
      req.privacyPermissions.personalization = {
        canPersonalize,
        userId
      };

      next();

    } catch (error) {
      console.error('❌ Erreur dans le middleware de permissions de personnalisation:', error);
      req.privacyPermissions = req.privacyPermissions || {};
      req.privacyPermissions.personalization = { canPersonalize: false };
      next();
    }
  }

  /**
   * Middleware pour vérifier la visibilité du profil
   */
  static async checkProfileVisibility(req, res, next) {
    try {
      // Si pas d'utilisateur connecté, profil privé par défaut
      if (!req.userData || !req.userData.userId) {
        req.privacyPermissions = req.privacyPermissions || {};
        req.privacyPermissions.profile = {
          level: 'private',
          showEmail: false,
          showPhone: false,
          showAddress: false
        };
        return next();
      }

      const userId = req.userData.userId;
      const visibility = await privacyService.getProfileVisibility(userId);
      
      req.privacyPermissions = req.privacyPermissions || {};
      req.privacyPermissions.profile = visibility;

      next();

    } catch (error) {
      console.error('❌ Erreur dans le middleware de visibilité du profil:', error);
      req.privacyPermissions = req.privacyPermissions || {};
      req.privacyPermissions.profile = {
        level: 'private',
        showEmail: false,
        showPhone: false,
        showAddress: false
      };
      next();
    }
  }

  /**
   * Middleware complet pour toutes les permissions de confidentialité
   */
  static async checkAllPrivacyPermissions(req, res, next) {
    try {
      // Si pas d'utilisateur connecté, appliquer les restrictions par défaut
      if (!req.userData || !req.userData.userId) {
        req.privacyPermissions = {
          marketing: { canReceive: false, type: 'email' },
          analytics: { canTrack: false },
          personalization: { canPersonalize: false },
          profile: {
            level: 'private',
            showEmail: false,
            showPhone: false,
            showAddress: false
          }
        };
        return next();
      }

      const userId = req.userData.userId;

      // Récupérer toutes les permissions en parallèle
      const [marketingPermissions, analyticsPermissions, personalizationPermissions, profileVisibility] = await Promise.all([
        privacyService.canReceiveMarketing(userId, 'email'),
        privacyService.canTrackAnalytics(userId),
        privacyService.canPersonalize(userId),
        privacyService.getProfileVisibility(userId)
      ]);

      req.privacyPermissions = {
        marketing: {
          canReceive: marketingPermissions,
          type: 'email',
          userId
        },
        analytics: {
          canTrack: analyticsPermissions,
          userId
        },
        personalization: {
          canPersonalize: personalizationPermissions,
          userId
        },
        profile: profileVisibility
      };

      next();

    } catch (error) {
      console.error('❌ Erreur dans le middleware de permissions de confidentialité:', error);
      // En cas d'erreur, appliquer les restrictions par défaut
      req.privacyPermissions = {
        marketing: { canReceive: false, type: 'email' },
        analytics: { canTrack: false },
        personalization: { canPersonalize: false },
        profile: {
          level: 'private',
          showEmail: false,
          showPhone: false,
          showAddress: false
        }
      };
      next();
    }
  }

  /**
   * Middleware pour filtrer les données selon les préférences
   */
  static filterDataByPrivacy(req, res, next) {
    try {
      const permissions = req.privacyPermissions;
      
      if (!permissions) {
        return next();
      }

      // Filtrer les données de réponse selon les permissions
      const originalJson = res.json;
      res.json = function(data) {
        if (data && typeof data === 'object') {
          data = PrivacyMiddleware.applyPrivacyFilters(data, permissions);
        }
        return originalJson.call(this, data);
      };

      next();

    } catch (error) {
      console.error('❌ Erreur dans le middleware de filtrage des données:', error);
      next();
    }
  }

  /**
   * Appliquer les filtres de confidentialité aux données
   */
  static applyPrivacyFilters(data, permissions) {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Si c'est un tableau, filtrer chaque élément
    if (Array.isArray(data)) {
      return data.map(item => PrivacyMiddleware.applyPrivacyFilters(item, permissions));
    }

    // Si c'est un objet, appliquer les filtres
    const filteredData = { ...data };

    // Filtrer les informations de profil selon la visibilité
    if (permissions.profile) {
      if (!permissions.profile.showEmail && filteredData.email) {
        filteredData.email = '[EMAIL_MASQUÉ]';
      }
      if (!permissions.profile.showPhone && filteredData.phone) {
        filteredData.phone = '[TÉLÉPHONE_MASQUÉ]';
      }
      if (!permissions.profile.showAddress && filteredData.address) {
        filteredData.address = '[ADRESSE_MASQUÉE]';
      }
    }

    // Filtrer les données personnalisées si non autorisé
    if (!permissions.personalization?.canPersonalize) {
      if (filteredData.recommendations) {
        filteredData.recommendations = [];
      }
      if (filteredData.personalizedContent) {
        filteredData.personalizedContent = null;
      }
    }

    // Filtrer les données de tracking si non autorisé
    if (!permissions.analytics?.canTrack) {
      if (filteredData.trackingData) {
        filteredData.trackingData = null;
      }
      if (filteredData.analytics) {
        filteredData.analytics = null;
      }
    }

    return filteredData;
  }

  /**
   * Middleware pour logger les violations de confidentialité
   */
  static logPrivacyViolations(req, res, next) {
    const originalJson = res.json;
    res.json = function(data) {
      // Vérifier si des données sensibles sont envoyées malgré les restrictions
      const permissions = req.privacyPermissions;
      
      if (permissions && data) {
        const violations = PrivacyMiddleware.detectPrivacyViolations(data, permissions);
        
        if (violations.length > 0) {
          console.warn('⚠️ Violations de confidentialité détectées:', {
            userId: req.userData?.userId,
            path: req.path,
            violations
          });
        }
      }

      return originalJson.call(this, data);
    };

    next();
  }

  /**
   * Détecter les violations de confidentialité
   */
  static detectPrivacyViolations(data, permissions) {
    const violations = [];

    if (!data || typeof data !== 'object') {
      return violations;
    }

    // Vérifier les violations de visibilité du profil
    if (permissions.profile) {
      if (!permissions.profile.showEmail && data.email && data.email !== '[EMAIL_MASQUÉ]') {
        violations.push('Email visible malgré les restrictions');
      }
      if (!permissions.profile.showPhone && data.phone && data.phone !== '[TÉLÉPHONE_MASQUÉ]') {
        violations.push('Téléphone visible malgré les restrictions');
      }
      if (!permissions.profile.showAddress && data.address && data.address !== '[ADRESSE_MASQUÉE]') {
        violations.push('Adresse visible malgré les restrictions');
      }
    }

    // Vérifier les violations de personnalisation
    if (!permissions.personalization?.canPersonalize) {
      if (data.recommendations && data.recommendations.length > 0) {
        violations.push('Recommandations personnalisées envoyées malgré les restrictions');
      }
      if (data.personalizedContent) {
        violations.push('Contenu personnalisé envoyé malgré les restrictions');
      }
    }

    // Vérifier les violations de tracking
    if (!permissions.analytics?.canTrack) {
      if (data.trackingData) {
        violations.push('Données de tracking envoyées malgré les restrictions');
      }
      if (data.analytics) {
        violations.push('Données analytics envoyées malgré les restrictions');
      }
    }

    return violations;
  }

  /**
   * Middleware pour ajouter les en-têtes de confidentialité
   */
  static addPrivacyHeaders(req, res, next) {
    const permissions = req.privacyPermissions;
    
    if (permissions) {
      // En-tête pour indiquer le niveau de confidentialité
      res.setHeader('X-Privacy-Level', permissions.profile?.level || 'private');
      
      // En-tête pour indiquer les permissions
      res.setHeader('X-Privacy-Permissions', JSON.stringify({
        marketing: permissions.marketing?.canReceive || false,
        analytics: permissions.analytics?.canTrack || false,
        personalization: permissions.personalization?.canPersonalize || false
      }));
    }

    next();
  }
}

module.exports = PrivacyMiddleware; 