const auditService = require('../services/auditService');

/**
 * Middleware pour l'audit trail automatique
 */
class AuditMiddleware {
  /**
   * Middleware pour logger automatiquement les actions d'authentification
   */
  static logAuthentication(actionType) {
    return async (req, res, next) => {
      const startTime = Date.now();
      const originalJson = res.json;
      const originalStatus = res.status;

      // Capturer les informations de requête
      const requestInfo = auditService.captureRequestInfo(req);

      // Override res.json pour capturer la réponse
      res.json = function(data) {
        const executionTime = Date.now() - startTime;
        
        // Logger l'action d'authentification
        if (req.userData && req.userData.userId) {
          auditService.logAuthentication(
            req.userData.userId,
            actionType,
            {
              ...requestInfo,
              response_status: res.statusCode,
              execution_time: executionTime,
              success: data.success || false,
              error: data.error || null
            }
          );
        } else if (actionType === 'LOGIN_FAILED') {
          // Pour les échecs de connexion, on peut ne pas avoir d'utilisateur
          auditService.logAuthentication(
            null,
            actionType,
            {
              ...requestInfo,
              response_status: res.statusCode,
              execution_time: executionTime,
              success: false,
              error: data.error || 'Échec de connexion'
            }
          );
        }

        return originalJson.call(this, data);
      };

      // Override res.status pour capturer le code de statut
      res.status = function(code) {
        res.statusCode = code;
        return originalStatus.call(this, code);
      };

      next();
    };
  }

  /**
   * Middleware pour logger automatiquement les actions de protection des données
   */
  static logDataProtection(actionType, resourceType = null) {
    return async (req, res, next) => {
      const startTime = Date.now();
      const originalJson = res.json;

      const requestInfo = auditService.captureRequestInfo(req);

      res.json = function(data) {
        const executionTime = Date.now() - startTime;
        
        if (req.userData && req.userData.userId) {
          const resourceId = req.params.id || req.body.id || req.query.id;
          
          auditService.logDataProtection(
            req.userData.userId,
            actionType,
            {
              ...requestInfo,
              resource_type: resourceType,
              resource_id: resourceId,
              response_status: res.statusCode,
              execution_time: executionTime,
              success: data.success || false
            }
          );
        }

        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Middleware pour logger automatiquement les actions RGPD
   */
  static logRGPD(actionType) {
    return async (req, res, next) => {
      const startTime = Date.now();
      const originalJson = res.json;

      const requestInfo = auditService.captureRequestInfo(req);

      res.json = function(data) {
        const executionTime = Date.now() - startTime;
        
        if (req.userData && req.userData.userId) {
          auditService.logRGPD(
            req.userData.userId,
            actionType,
            {
              ...requestInfo,
              response_status: res.statusCode,
              execution_time: executionTime,
              success: data.success || false
            }
          );
        }

        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Middleware pour logger automatiquement les actions de gestion des commandes
   */
  static logOrderManagement(actionType) {
    return async (req, res, next) => {
      const startTime = Date.now();
      const originalJson = res.json;

      const requestInfo = auditService.captureRequestInfo(req);

      res.json = function(data) {
        const executionTime = Date.now() - startTime;
        
        if (req.userData && req.userData.userId) {
          const orderId = req.params.orderId || req.params.id || req.body.orderId;
          
          auditService.logOrderManagement(
            req.userData.userId,
            actionType,
            orderId,
            {
              ...requestInfo,
              response_status: res.statusCode,
              execution_time: executionTime,
              success: data.success || false
            }
          );
        }

        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Middleware pour logger automatiquement les actions de gestion des produits
   */
  static logProductManagement(actionType) {
    return async (req, res, next) => {
      const startTime = Date.now();
      const originalJson = res.json;

      const requestInfo = auditService.captureRequestInfo(req);

      res.json = function(data) {
        const executionTime = Date.now() - startTime;
        
        if (req.userData && req.userData.userId) {
          const productId = req.params.productId || req.params.id || req.body.productId;
          
          auditService.logProductManagement(
            req.userData.userId,
            actionType,
            productId,
            {
              ...requestInfo,
              response_status: res.statusCode,
              execution_time: executionTime,
              success: data.success || false
            }
          );
        }

        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Middleware pour logger automatiquement les actions de gestion des utilisateurs
   */
  static logUserManagement(actionType) {
    return async (req, res, next) => {
      const startTime = Date.now();
      const originalJson = res.json;

      const requestInfo = auditService.captureRequestInfo(req);

      res.json = function(data) {
        const executionTime = Date.now() - startTime;
        
        if (req.userData && req.userData.userId) {
          const targetUserId = req.params.userId || req.params.id || req.body.userId;
          
          auditService.logUserManagement(
            req.userData.userId,
            actionType,
            targetUserId,
            {
              ...requestInfo,
              response_status: res.statusCode,
              execution_time: executionTime,
              success: data.success || false
            }
          );
        }

        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Middleware pour logger automatiquement les alertes de sécurité
   */
  static logSecurityAlert(actionType) {
    return async (req, res, next) => {
      const startTime = Date.now();
      const originalJson = res.json;

      const requestInfo = auditService.captureRequestInfo(req);

      res.json = function(data) {
        const executionTime = Date.now() - startTime;
        
        const userId = req.userData ? req.userData.userId : null;
        
        auditService.logSecurityAlert(
          userId,
          actionType,
          {
            ...requestInfo,
            response_status: res.statusCode,
            execution_time: executionTime,
            success: data.success || false,
            security_flags: {
              suspicious: data.suspicious || false,
              blocked: data.blocked || false,
              rate_limited: data.rate_limited || false
            }
          }
        );

        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Middleware pour logger automatiquement les actions système
   */
  static logSystemAction(actionType) {
    return async (req, res, next) => {
      const startTime = Date.now();
      const originalJson = res.json;

      const requestInfo = auditService.captureRequestInfo(req);

      res.json = function(data) {
        const executionTime = Date.now() - startTime;
        
        auditService.logSystemAction(
          actionType,
          {
            ...requestInfo,
            response_status: res.statusCode,
            execution_time: executionTime,
            success: data.success || false,
            context_data: {
              system_info: process.env.NODE_ENV,
              timestamp: new Date().toISOString()
            }
          }
        );

        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Middleware pour capturer les changements de ressources (before/after)
   */
  static captureResourceChanges(resourceType) {
    return async (req, res, next) => {
      const originalJson = res.json;
      let resourceBefore = null;
      let resourceAfter = null;

      // Capturer l'état avant pour les modifications
      if (req.method === 'PUT' || req.method === 'PATCH') {
        const resourceId = req.params.id;
        if (resourceId) {
          try {
            // Ici vous devriez récupérer l'état actuel de la ressource
            // Cela dépend de votre modèle de données
            // resourceBefore = await ResourceModel.findByPk(resourceId);
          } catch (error) {
            console.error('Erreur lors de la capture de l\'état avant:', error);
          }
        }
      }

      res.json = function(data) {
        // Capturer l'état après
        if (data.success && data.data) {
          resourceAfter = data.data;
        }

        // Ajouter les informations de changement à la requête
        req.auditChanges = {
          resourceBefore,
          resourceAfter,
          resourceType
        };

        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Middleware pour logger les performances
   */
  static logPerformance() {
    return async (req, res, next) => {
      const startTime = Date.now();
      const startMemory = process.memoryUsage();

      const originalJson = res.json;

      res.json = function(data) {
        const executionTime = Date.now() - startTime;
        const endMemory = process.memoryUsage();
        const memoryUsage = endMemory.heapUsed - startMemory.heapUsed;

        // Logger les performances si elles dépassent les seuils
        if (executionTime > 1000 || memoryUsage > 50 * 1024 * 1024) { // 1s ou 50MB
          auditService.logSystemAction('PERFORMANCE_ALERT', {
            execution_time: executionTime,
            memory_usage: memoryUsage,
            path: req.path,
            method: req.method,
            user_id: req.userData?.userId
          });
        }

        return originalJson.call(this, data);
      };

      next();
    };
  }

  /**
   * Middleware pour détecter les activités suspectes
   */
  static detectSuspiciousActivity() {
    return async (req, res, next) => {
      const requestInfo = auditService.captureRequestInfo(req);
      const suspiciousFlags = [];

      // Détecter les tentatives de connexion multiples
      if (req.path.includes('/login') && req.method === 'POST') {
        // Ici vous pourriez implémenter une logique de détection
        // basée sur l'IP, le user-agent, etc.
      }

      // Détecter les accès à des ressources sensibles
      if (req.path.includes('/admin') && req.userData?.role !== 'admin') {
        suspiciousFlags.push('UNAUTHORIZED_ADMIN_ACCESS');
      }

      // Détecter les requêtes anormales
      if (req.headers['user-agent'] && req.headers['user-agent'].includes('bot')) {
        suspiciousFlags.push('BOT_ACTIVITY');
      }

      // Logger les activités suspectes
      if (suspiciousFlags.length > 0) {
        auditService.logSecurityAlert('SUSPICIOUS_ACTIVITY', {
          ...requestInfo,
          security_flags: {
            suspicious: true,
            flags: suspiciousFlags
          }
        });
      }

      next();
    };
  }

  /**
   * Middleware pour logger les erreurs
   */
  static logErrors() {
    return (err, req, res, next) => {
      const requestInfo = auditService.captureRequestInfo(req);
      
      auditService.logSecurityAlert('SECURITY_ALERT', {
        ...requestInfo,
        error: {
          message: err.message,
          stack: err.stack,
          status: err.status || 500
        },
        security_flags: {
          error: true,
          critical: err.status >= 500
        }
      });

      next(err);
    };
  }
}

module.exports = AuditMiddleware; 