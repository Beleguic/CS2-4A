const auditService = require('../services/auditService');
const { User } = require('../models');

class AuditController {
  /**
   * Obtenir les logs d'audit avec filtres
   */
  async getAuditLogs(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const filters = {
        userId: req.query.userId,
        actionType: req.query.actionType,
        actionCategory: req.query.actionCategory,
        actionSeverity: req.query.actionSeverity,
        resourceType: req.query.resourceType,
        resourceId: req.query.resourceId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        ipAddress: req.query.ipAddress
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const result = await auditService.getAuditLogs(filters, pagination);

      res.json({
        success: true,
        logs: result.logs,
        pagination: result.pagination,
        filters: filters
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des logs d\'audit:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des logs d\'audit',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtenir les statistiques d'audit
   */
  async getAuditStats(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        userId: req.query.userId
      };

      const stats = await auditService.getAuditStats(filters);

      res.json({
        success: true,
        stats: stats
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques d\'audit:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des statistiques d\'audit',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtenir un log d'audit spécifique
   */
  async getAuditLogById(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const { logId } = req.params;

      const AuditLog = require('../models/auditLog');
      const log = await AuditLog.findByPk(logId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'username']
          }
        ]
      });

      if (!log) {
        return res.status(404).json({
          error: 'Log d\'audit non trouvé'
        });
      }

      res.json({
        success: true,
        log: log
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération du log d\'audit:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération du log d\'audit',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtenir les logs d'audit d'un utilisateur spécifique
   */
  async getUserAuditLogs(req, res) {
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

      const filters = {
        userId: userId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        actionType: req.query.actionType,
        actionCategory: req.query.actionCategory,
        actionSeverity: req.query.actionSeverity
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const result = await auditService.getAuditLogs(filters, pagination);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        logs: result.logs,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des logs d\'audit utilisateur:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des logs d\'audit utilisateur',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtenir les logs d'audit critiques
   */
  async getCriticalAuditLogs(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const filters = {
        actionSeverity: 'CRITICAL',
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const result = await auditService.getAuditLogs(filters, pagination);

      res.json({
        success: true,
        logs: result.logs,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des logs critiques:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des logs critiques',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtenir les logs d'audit de sécurité
   */
  async getSecurityAuditLogs(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const filters = {
        actionCategory: 'SECURITY',
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const result = await auditService.getAuditLogs(filters, pagination);

      res.json({
        success: true,
        logs: result.logs,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des logs de sécurité:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des logs de sécurité',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtenir les logs d'audit RGPD
   */
  async getRGPDAuditLogs(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const filters = {
        actionCategory: 'RGPD',
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50
      };

      const result = await auditService.getAuditLogs(filters, pagination);

      res.json({
        success: true,
        logs: result.logs,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des logs RGPD:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des logs RGPD',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Nettoyer les logs expirés
   */
  async cleanupExpiredLogs(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const result = await auditService.cleanupExpiredLogs();

      res.json({
        success: true,
        message: `Nettoyage terminé: ${result.archived} logs archivés`,
        result: result
      });

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des logs expirés:', error);
      res.status(500).json({ 
        error: 'Erreur lors du nettoyage des logs expirés',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Exporter les logs d'audit
   */
  async exportAuditLogs(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      const filters = {
        userId: req.query.userId,
        actionType: req.query.actionType,
        actionCategory: req.query.actionCategory,
        actionSeverity: req.query.actionSeverity,
        resourceType: req.query.resourceType,
        resourceId: req.query.resourceId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        ipAddress: req.query.ipAddress
      };

      const exportData = await auditService.exportAuditLogs(filters);

      res.json({
        success: true,
        export: exportData
      });

    } catch (error) {
      console.error('❌ Erreur lors de l\'export des logs d\'audit:', error);
      res.status(500).json({ 
        error: 'Erreur lors de l\'export des logs d\'audit',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtenir les logs d'audit en temps réel (pour les alertes)
   */
  async getRealTimeAuditLogs(req, res) {
    try {
      // Vérifier que l'utilisateur est admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          error: 'Accès refusé. Rôle administrateur requis.' 
        });
      }

      // Obtenir les logs des dernières 24 heures
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 24);

      const filters = {
        startDate: startDate.toISOString(),
        actionSeverity: ['HIGH', 'CRITICAL']
      };

      const pagination = {
        page: 1,
        limit: 100
      };

      const result = await auditService.getAuditLogs(filters, pagination);

      res.json({
        success: true,
        logs: result.logs,
        total: result.pagination.total,
        lastUpdate: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des logs en temps réel:', error);
      res.status(500).json({ 
        error: 'Erreur lors de la récupération des logs en temps réel',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtenir la documentation de l'audit trail
   */
  async getAuditDocumentation(req, res) {
    try {
      const documentation = {
        title: 'Documentation de l\'Audit Trail - Tropicool',
        version: '1.0',
        description: 'Guide complet du système d\'audit trail et de traçabilité',
        
        actionTypes: {
          authentication: [
            'LOGIN_SUCCESS',
            'LOGIN_FAILED',
            'LOGOUT',
            'PASSWORD_CHANGE',
            'PASSWORD_RESET',
            'ACCOUNT_LOCKED',
            'ACCOUNT_UNLOCKED'
          ],
          dataProtection: [
            'DATA_ACCESS',
            'DATA_EXPORT',
            'DATA_DELETION',
            'DATA_ANONYMIZATION',
            'PRIVACY_PREFERENCES_UPDATE'
          ],
          orderManagement: [
            'ORDER_CREATED',
            'ORDER_MODIFIED',
            'ORDER_CANCELLED',
            'PAYMENT_PROCESSED',
            'PAYMENT_FAILED'
          ],
          productManagement: [
            'PRODUCT_CREATED',
            'PRODUCT_MODIFIED',
            'PRODUCT_DELETED',
            'STOCK_MODIFIED'
          ],
          userManagement: [
            'USER_CREATED',
            'USER_MODIFIED',
            'USER_DELETED',
            'USER_ROLE_CHANGED'
          ],
          security: [
            'SECURITY_ALERT',
            'SUSPICIOUS_ACTIVITY',
            'RATE_LIMIT_EXCEEDED',
            'IP_BLOCKED'
          ],
          system: [
            'SYSTEM_BACKUP',
            'SYSTEM_MAINTENANCE',
            'CONFIGURATION_CHANGE'
          ],
          rgpd: [
            'CONSENT_GIVEN',
            'CONSENT_WITHDRAWN',
            'DATA_PORTABILITY_REQUEST',
            'RIGHT_TO_ERASURE_REQUEST',
            'RIGHT_TO_RECTIFICATION_REQUEST'
          ]
        },

        severityLevels: {
          CRITICAL: 'Actions critiques nécessitant une attention immédiate',
          HIGH: 'Actions importantes nécessitant une surveillance',
          MEDIUM: 'Actions normales avec impact modéré',
          LOW: 'Actions de routine sans impact significatif'
        },

        retentionPeriods: {
          '30_DAYS': 'Logs de faible importance',
          '90_DAYS': 'Logs d\'importance moyenne',
          '1_YEAR': 'Logs d\'importance élevée',
          '3_YEARS': 'Logs critiques et RGPD',
          'INDEFINITE': 'Logs de sécurité critiques'
        },

        api: {
          endpoints: [
            {
              method: 'GET',
              path: '/api/audit/logs',
              description: 'Obtenir les logs d\'audit avec filtres',
              auth: 'Admin uniquement'
            },
            {
              method: 'GET',
              path: '/api/audit/stats',
              description: 'Obtenir les statistiques d\'audit',
              auth: 'Admin uniquement'
            },
            {
              method: 'GET',
              path: '/api/audit/logs/:logId',
              description: 'Obtenir un log d\'audit spécifique',
              auth: 'Admin uniquement'
            },
            {
              method: 'GET',
              path: '/api/audit/users/:userId/logs',
              description: 'Obtenir les logs d\'un utilisateur',
              auth: 'Admin uniquement'
            },
            {
              method: 'GET',
              path: '/api/audit/critical',
              description: 'Obtenir les logs critiques',
              auth: 'Admin uniquement'
            },
            {
              method: 'GET',
              path: '/api/audit/security',
              description: 'Obtenir les logs de sécurité',
              auth: 'Admin uniquement'
            },
            {
              method: 'GET',
              path: '/api/audit/rgpd',
              description: 'Obtenir les logs RGPD',
              auth: 'Admin uniquement'
            },
            {
              method: 'POST',
              path: '/api/audit/cleanup',
              description: 'Nettoyer les logs expirés',
              auth: 'Admin uniquement'
            },
            {
              method: 'GET',
              path: '/api/audit/export',
              description: 'Exporter les logs d\'audit',
              auth: 'Admin uniquement'
            },
            {
              method: 'GET',
              path: '/api/audit/realtime',
              description: 'Logs en temps réel',
              auth: 'Admin uniquement'
            }
          ]
        },

        compliance: {
          rgpd: [
            'Traçabilité complète des accès aux données personnelles',
            'Enregistrement des demandes de droits RGPD',
            'Audit des modifications de préférences de confidentialité',
            'Historique des consentements et retraits'
          ],
          security: [
            'Surveillance des tentatives d\'accès non autorisées',
            'Détection d\'activités suspectes',
            'Traçabilité des modifications de sécurité',
            'Audit des changements de rôles utilisateur'
          ],
          business: [
            'Traçabilité des transactions et paiements',
            'Audit des modifications de produits et stocks',
            'Historique des commandes et annulations',
            'Surveillance des actions administratives'
          ]
        },

        features: [
          'Logging automatique de toutes les actions sensibles',
          'Catégorisation et classification des actions',
          'Niveaux de sévérité configurables',
          'Périodes de rétention adaptatives',
          'Filtrage et recherche avancés',
          'Export et reporting',
          'Nettoyage automatique des logs expirés',
          'Intégration avec les systèmes de sécurité',
          'Conformité RGPD et audit'
        ]
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

module.exports = new AuditController(); 