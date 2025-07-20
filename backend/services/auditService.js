const AuditLog = require('../models/auditLog');
const { User } = require('../models');
const { sequelize } = require('../models/db');

class AuditService {
  /**
   * Créer un log d'audit
   */
  async createAuditLog(data) {
    try {
      // Nettoyer les données sensibles du corps de la requête
      if (data.request_body) {
        data.request_body = this.sanitizeRequestBody(data.request_body);
      }

      // Nettoyer les en-têtes sensibles
      if (data.request_headers) {
        data.request_headers = this.sanitizeHeaders(data.request_headers);
      }

      const auditLog = await AuditLog.create(data);
      
      console.log(`📝 Log d'audit créé: ${data.action_type} - ${data.action_description}`);
      
      return auditLog;

    } catch (error) {
      console.error('❌ Erreur lors de la création du log d\'audit:', error);
      throw error;
    }
  }

  /**
   * Logger une action d'authentification
   */
  async logAuthentication(userId, actionType, details = {}) {
    const descriptions = {
      LOGIN_SUCCESS: 'Connexion réussie',
      LOGIN_FAILED: 'Tentative de connexion échouée',
      LOGOUT: 'Déconnexion',
      PASSWORD_CHANGE: 'Changement de mot de passe',
      PASSWORD_RESET: 'Réinitialisation de mot de passe',
      ACCOUNT_LOCKED: 'Compte verrouillé',
      ACCOUNT_UNLOCKED: 'Compte déverrouillé'
    };

    return await this.createAuditLog({
      user_id: userId,
      action_type: actionType,
      action_description: descriptions[actionType] || actionType,
      action_details: details,
      action_category: 'AUTHENTICATION',
      ip_address: details.ip_address,
      user_agent: details.user_agent,
      session_id: details.session_id,
      request_method: details.request_method,
      request_url: details.request_url,
      response_status: details.response_status,
      security_flags: details.security_flags
    });
  }

  /**
   * Logger une action de protection des données
   */
  async logDataProtection(userId, actionType, details = {}) {
    const descriptions = {
      DATA_ACCESS: 'Accès aux données personnelles',
      DATA_EXPORT: 'Export de données personnelles',
      DATA_DELETION: 'Suppression de données personnelles',
      DATA_ANONYMIZATION: 'Anonymisation de données',
      PRIVACY_PREFERENCES_UPDATE: 'Mise à jour des préférences de confidentialité'
    };

    return await this.createAuditLog({
      user_id: userId,
      action_type: actionType,
      action_description: descriptions[actionType] || actionType,
      action_details: details,
      action_category: 'DATA_PROTECTION',
      resource_type: details.resource_type,
      resource_id: details.resource_id,
      resource_before: details.resource_before,
      resource_after: details.resource_after,
      ip_address: details.ip_address,
      user_agent: details.user_agent,
      request_method: details.request_method,
      request_url: details.request_url,
      response_status: details.response_status
    });
  }

  /**
   * Logger une action RGPD
   */
  async logRGPD(userId, actionType, details = {}) {
    const descriptions = {
      CONSENT_GIVEN: 'Consentement donné',
      CONSENT_WITHDRAWN: 'Consentement retiré',
      DATA_PORTABILITY_REQUEST: 'Demande de portabilité des données',
      RIGHT_TO_ERASURE_REQUEST: 'Demande de droit à l\'effacement',
      RIGHT_TO_RECTIFICATION_REQUEST: 'Demande de droit de rectification'
    };

    return await this.createAuditLog({
      user_id: userId,
      action_type: actionType,
      action_description: descriptions[actionType] || actionType,
      action_details: details,
      action_category: 'RGPD',
      resource_type: details.resource_type,
      resource_id: details.resource_id,
      ip_address: details.ip_address,
      user_agent: details.user_agent,
      request_method: details.request_method,
      request_url: details.request_url,
      response_status: details.response_status
    });
  }

  /**
   * Logger une action de gestion des commandes
   */
  async logOrderManagement(userId, actionType, orderId, details = {}) {
    const descriptions = {
      ORDER_CREATED: 'Commande créée',
      ORDER_MODIFIED: 'Commande modifiée',
      ORDER_CANCELLED: 'Commande annulée',
      PAYMENT_PROCESSED: 'Paiement traité',
      PAYMENT_FAILED: 'Échec du paiement'
    };

    return await this.createAuditLog({
      user_id: userId,
      action_type: actionType,
      action_description: descriptions[actionType] || actionType,
      action_details: details,
      action_category: 'ORDER_MANAGEMENT',
      resource_type: 'order',
      resource_id: orderId.toString(),
      resource_before: details.resource_before,
      resource_after: details.resource_after,
      ip_address: details.ip_address,
      user_agent: details.user_agent,
      request_method: details.request_method,
      request_url: details.request_url,
      response_status: details.response_status
    });
  }

  /**
   * Logger une action de gestion des produits
   */
  async logProductManagement(userId, actionType, productId, details = {}) {
    const descriptions = {
      PRODUCT_CREATED: 'Produit créé',
      PRODUCT_MODIFIED: 'Produit modifié',
      PRODUCT_DELETED: 'Produit supprimé',
      STOCK_MODIFIED: 'Stock modifié'
    };

    return await this.createAuditLog({
      user_id: userId,
      action_type: actionType,
      action_description: descriptions[actionType] || actionType,
      action_details: details,
      action_category: 'PRODUCT_MANAGEMENT',
      resource_type: 'product',
      resource_id: productId.toString(),
      resource_before: details.resource_before,
      resource_after: details.resource_after,
      ip_address: details.ip_address,
      user_agent: details.user_agent,
      request_method: details.request_method,
      request_url: details.request_url,
      response_status: details.response_status
    });
  }

  /**
   * Logger une action de gestion des utilisateurs
   */
  async logUserManagement(adminUserId, actionType, targetUserId, details = {}) {
    const descriptions = {
      USER_CREATED: 'Utilisateur créé',
      USER_MODIFIED: 'Utilisateur modifié',
      USER_DELETED: 'Utilisateur supprimé',
      USER_ROLE_CHANGED: 'Rôle utilisateur modifié'
    };

    return await this.createAuditLog({
      user_id: adminUserId,
      action_type: actionType,
      action_description: descriptions[actionType] || actionType,
      action_details: { ...details, target_user_id: targetUserId },
      action_category: 'USER_MANAGEMENT',
      resource_type: 'user',
      resource_id: targetUserId.toString(),
      resource_before: details.resource_before,
      resource_after: details.resource_after,
      ip_address: details.ip_address,
      user_agent: details.user_agent,
      request_method: details.request_method,
      request_url: details.request_url,
      response_status: details.response_status
    });
  }

  /**
   * Logger une alerte de sécurité
   */
  async logSecurityAlert(userId, actionType, details = {}) {
    const descriptions = {
      SECURITY_ALERT: 'Alerte de sécurité',
      SUSPICIOUS_ACTIVITY: 'Activité suspecte détectée',
      RATE_LIMIT_EXCEEDED: 'Limite de taux dépassée',
      IP_BLOCKED: 'Adresse IP bloquée'
    };

    return await this.createAuditLog({
      user_id: userId,
      action_type: actionType,
      action_description: descriptions[actionType] || actionType,
      action_details: details,
      action_category: 'SECURITY',
      ip_address: details.ip_address,
      user_agent: details.user_agent,
      request_method: details.request_method,
      request_url: details.request_url,
      response_status: details.response_status,
      security_flags: details.security_flags
    });
  }

  /**
   * Logger une action système
   */
  async logSystemAction(actionType, details = {}) {
    const descriptions = {
      SYSTEM_BACKUP: 'Sauvegarde système',
      SYSTEM_MAINTENANCE: 'Maintenance système',
      CONFIGURATION_CHANGE: 'Changement de configuration'
    };

    return await this.createAuditLog({
      user_id: null, // Action système, pas d'utilisateur spécifique
      action_type: actionType,
      action_description: descriptions[actionType] || actionType,
      action_details: details,
      action_category: 'SYSTEM',
      context_data: details.context_data
    });
  }

  /**
   * Obtenir les logs d'audit avec filtres
   */
  async getAuditLogs(filters = {}, pagination = {}) {
    try {
      const {
        userId,
        actionType,
        actionCategory,
        actionSeverity,
        resourceType,
        resourceId,
        startDate,
        endDate,
        ipAddress,
        page = 1,
        limit = 50
      } = filters;

      const whereClause = {};

      if (userId) whereClause.user_id = userId;
      if (actionType) whereClause.action_type = actionType;
      if (actionCategory) whereClause.action_category = actionCategory;
      if (actionSeverity) whereClause.action_severity = actionSeverity;
      if (resourceType) whereClause.resource_type = resourceType;
      if (resourceId) whereClause.resource_id = resourceId;
      if (ipAddress) whereClause.ip_address = ipAddress;

      if (startDate || endDate) {
        whereClause.created_at = {};
        if (startDate) whereClause.created_at[sequelize.Op.gte] = new Date(startDate);
        if (endDate) whereClause.created_at[sequelize.Op.lte] = new Date(endDate);
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await AuditLog.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'username']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      return {
        logs: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des logs d\'audit:', error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques d'audit
   */
  async getAuditStats(filters = {}) {
    try {
      const { startDate, endDate, userId } = filters;
      
      const whereClause = {};
      if (startDate || endDate) {
        whereClause.created_at = {};
        if (startDate) whereClause.created_at[sequelize.Op.gte] = new Date(startDate);
        if (endDate) whereClause.created_at[sequelize.Op.lte] = new Date(endDate);
      }
      if (userId) whereClause.user_id = userId;

      const stats = await AuditLog.findAll({
        where: whereClause,
        attributes: [
          'action_category',
          'action_severity',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['action_category', 'action_severity']
      });

      const totalLogs = await AuditLog.count({ where: whereClause });
      const criticalLogs = await AuditLog.count({
        where: { ...whereClause, action_severity: 'CRITICAL' }
      });
      const highSeverityLogs = await AuditLog.count({
        where: { ...whereClause, action_severity: ['HIGH', 'CRITICAL'] }
      });

      return {
        totalLogs,
        criticalLogs,
        highSeverityLogs,
        breakdown: stats.reduce((acc, stat) => {
          const category = stat.action_category;
          const severity = stat.action_severity;
          const count = parseInt(stat.dataValues.count);
          
          if (!acc[category]) acc[category] = {};
          acc[category][severity] = count;
          
          return acc;
        }, {})
      };

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques d\'audit:', error);
      throw error;
    }
  }

  /**
   * Nettoyer les logs expirés
   */
  async cleanupExpiredLogs() {
    try {
      const logsToArchive = await AuditLog.findAll({
        where: {
          is_archived: false,
          created_at: {
            [sequelize.Op.lt]: sequelize.literal('DATE_SUB(NOW(), INTERVAL 1 YEAR)')
          }
        }
      });

      let archived = 0;
      for (const log of logsToArchive) {
        if (log.shouldBeArchived()) {
          await log.update({
            is_archived: true,
            archive_date: new Date()
          });
          archived++;
        }
      }

      console.log(`🧹 ${archived} logs d'audit archivés`);
      return { archived };

    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des logs expirés:', error);
      throw error;
    }
  }

  /**
   * Exporter les logs d'audit
   */
  async exportAuditLogs(filters = {}) {
    try {
      const { logs } = await this.getAuditLogs(filters, { page: 1, limit: 10000 });

      const exportData = logs.map(log => ({
        id: log.id,
        user_id: log.user_id,
        user_email: log.user?.email || 'N/A',
        action_type: log.action_type,
        action_category: log.action_category,
        action_severity: log.action_severity,
        action_description: log.action_description,
        resource_type: log.resource_type,
        resource_id: log.resource_id,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        request_method: log.request_method,
        request_url: log.request_url,
        response_status: log.response_status,
        execution_time: log.execution_time,
        created_at: log.created_at,
        retention_period: log.retention_period,
        is_archived: log.is_archived
      }));

      return {
        exportDate: new Date().toISOString(),
        totalLogs: exportData.length,
        filters: filters,
        data: exportData
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'export des logs d\'audit:', error);
      throw error;
    }
  }

  /**
   * Nettoyer les données sensibles du corps de la requête
   */
  sanitizeRequestBody(body) {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[SENSIBLE]';
      }
    });

    return sanitized;
  }

  /**
   * Nettoyer les en-têtes sensibles
   */
  sanitizeHeaders(headers) {
    if (!headers || typeof headers !== 'object') {
      return headers;
    }

    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];

    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[SENSIBLE]';
      }
    });

    return sanitized;
  }

  /**
   * Middleware pour capturer automatiquement les informations de requête
   */
  captureRequestInfo(req) {
    return {
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent'),
      session_id: req.session?.id,
      request_method: req.method,
      request_url: req.originalUrl,
      request_headers: req.headers,
      request_body: req.body
    };
  }
}

module.exports = new AuditService(); 