const { DataTypes } = require('sequelize');
const { sequelize } = require('./db');
const { User } = require('./index');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  // Informations sur l'utilisateur
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Peut être null pour les actions anonymes
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL'
  },

  // Informations sur l'action
  action_type: {
    type: DataTypes.ENUM(
      // Authentification
      'LOGIN_SUCCESS',
      'LOGIN_FAILED',
      'LOGOUT',
      'PASSWORD_CHANGE',
      'PASSWORD_RESET',
      'ACCOUNT_LOCKED',
      'ACCOUNT_UNLOCKED',
      
      // Gestion des données personnelles
      'DATA_ACCESS',
      'DATA_EXPORT',
      'DATA_DELETION',
      'DATA_ANONYMIZATION',
      'PRIVACY_PREFERENCES_UPDATE',
      
      // Gestion des commandes
      'ORDER_CREATED',
      'ORDER_MODIFIED',
      'ORDER_CANCELLED',
      'PAYMENT_PROCESSED',
      'PAYMENT_FAILED',
      
      // Gestion des produits
      'PRODUCT_CREATED',
      'PRODUCT_MODIFIED',
      'PRODUCT_DELETED',
      'STOCK_MODIFIED',
      
      // Gestion des utilisateurs (admin)
      'USER_CREATED',
      'USER_MODIFIED',
      'USER_DELETED',
      'USER_ROLE_CHANGED',
      
      // Sécurité
      'SECURITY_ALERT',
      'SUSPICIOUS_ACTIVITY',
      'RATE_LIMIT_EXCEEDED',
      'IP_BLOCKED',
      
      // Système
      'SYSTEM_BACKUP',
      'SYSTEM_MAINTENANCE',
      'CONFIGURATION_CHANGE',
      
      // RGPD
      'CONSENT_GIVEN',
      'CONSENT_WITHDRAWN',
      'DATA_PORTABILITY_REQUEST',
      'RIGHT_TO_ERASURE_REQUEST',
      'RIGHT_TO_RECTIFICATION_REQUEST'
    ),
    allowNull: false,
    comment: 'Type d\'action effectuée'
  },

  action_category: {
    type: DataTypes.ENUM(
      'AUTHENTICATION',
      'DATA_PROTECTION',
      'ORDER_MANAGEMENT',
      'PRODUCT_MANAGEMENT',
      'USER_MANAGEMENT',
      'SECURITY',
      'SYSTEM',
      'RGPD'
    ),
    allowNull: false,
    comment: 'Catégorie de l\'action'
  },

  action_severity: {
    type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
    defaultValue: 'MEDIUM',
    comment: 'Niveau de gravité de l\'action'
  },

  // Détails de l'action
  action_description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Description détaillée de l\'action'
  },

  action_details: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Détails supplémentaires de l\'action (JSON)'
  },

  // Informations sur la ressource
  resource_type: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Type de ressource concernée (user, order, product, etc.)'
  },

  resource_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID de la ressource concernée'
  },

  resource_before: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'État de la ressource avant l\'action'
  },

  resource_after: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'État de la ressource après l\'action'
  },

  // Informations techniques
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Adresse IP de l\'utilisateur'
  },

  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User-Agent du navigateur'
  },

  session_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'ID de session'
  },

  request_method: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Méthode HTTP utilisée'
  },

  request_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'URL de la requête'
  },

  request_headers: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'En-têtes de la requête'
  },

  request_body: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Corps de la requête (sans données sensibles)'
  },

  response_status: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Code de statut de la réponse'
  },

  // Informations de performance
  execution_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Temps d\'exécution en millisecondes'
  },

  memory_usage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Utilisation mémoire en bytes'
  },

  // Informations de contexte
  context_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Données de contexte supplémentaires'
  },

  // Informations de sécurité
  security_flags: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Drapeaux de sécurité (suspicious, blocked, etc.)'
  },

  // Informations de rétention
  retention_period: {
    type: DataTypes.ENUM('30_DAYS', '90_DAYS', '1_YEAR', '3_YEARS', 'INDEFINITE'),
    allowNull: false,
    defaultValue: '1_YEAR',
    comment: 'Période de rétention du log'
  },

  is_archived: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indique si le log est archivé'
  },

  archive_date: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date d\'archivage'
  },

  // Métadonnées
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },

  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['action_type']
    },
    {
      fields: ['action_category']
    },
    {
      fields: ['action_severity']
    },
    {
      fields: ['resource_type', 'resource_id']
    },
    {
      fields: ['ip_address']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['is_archived']
    },
    {
      fields: ['retention_period']
    },
    // Index composite pour les requêtes fréquentes
    {
      fields: ['user_id', 'created_at']
    },
    {
      fields: ['action_type', 'created_at']
    },
    {
      fields: ['action_severity', 'created_at']
    }
  ],

  hooks: {
    beforeCreate: (auditLog) => {
      // Définir automatiquement la catégorie selon le type d'action
      if (!auditLog.action_category) {
        auditLog.action_category = AuditLog.getCategoryFromActionType(auditLog.action_type);
      }

      // Définir automatiquement la sévérité selon le type d'action
      if (!auditLog.action_severity) {
        auditLog.action_severity = AuditLog.getSeverityFromActionType(auditLog.action_type);
      }

      // Définir automatiquement la période de rétention selon la sévérité
      if (!auditLog.retention_period) {
        auditLog.retention_period = AuditLog.getRetentionFromSeverity(auditLog.action_severity);
      }
    }
  }
});

// Méthodes de classe
AuditLog.getCategoryFromActionType = function(actionType) {
  const categoryMap = {
    // Authentification
    LOGIN_SUCCESS: 'AUTHENTICATION',
    LOGIN_FAILED: 'AUTHENTICATION',
    LOGOUT: 'AUTHENTICATION',
    PASSWORD_CHANGE: 'AUTHENTICATION',
    PASSWORD_RESET: 'AUTHENTICATION',
    ACCOUNT_LOCKED: 'AUTHENTICATION',
    ACCOUNT_UNLOCKED: 'AUTHENTICATION',
    
    // Protection des données
    DATA_ACCESS: 'DATA_PROTECTION',
    DATA_EXPORT: 'DATA_PROTECTION',
    DATA_DELETION: 'DATA_PROTECTION',
    DATA_ANONYMIZATION: 'DATA_PROTECTION',
    PRIVACY_PREFERENCES_UPDATE: 'DATA_PROTECTION',
    
    // Gestion des commandes
    ORDER_CREATED: 'ORDER_MANAGEMENT',
    ORDER_MODIFIED: 'ORDER_MANAGEMENT',
    ORDER_CANCELLED: 'ORDER_MANAGEMENT',
    PAYMENT_PROCESSED: 'ORDER_MANAGEMENT',
    PAYMENT_FAILED: 'ORDER_MANAGEMENT',
    
    // Gestion des produits
    PRODUCT_CREATED: 'PRODUCT_MANAGEMENT',
    PRODUCT_MODIFIED: 'PRODUCT_MANAGEMENT',
    PRODUCT_DELETED: 'PRODUCT_MANAGEMENT',
    STOCK_MODIFIED: 'PRODUCT_MANAGEMENT',
    
    // Gestion des utilisateurs
    USER_CREATED: 'USER_MANAGEMENT',
    USER_MODIFIED: 'USER_MANAGEMENT',
    USER_DELETED: 'USER_MANAGEMENT',
    USER_ROLE_CHANGED: 'USER_MANAGEMENT',
    
    // Sécurité
    SECURITY_ALERT: 'SECURITY',
    SUSPICIOUS_ACTIVITY: 'SECURITY',
    RATE_LIMIT_EXCEEDED: 'SECURITY',
    IP_BLOCKED: 'SECURITY',
    
    // Système
    SYSTEM_BACKUP: 'SYSTEM',
    SYSTEM_MAINTENANCE: 'SYSTEM',
    CONFIGURATION_CHANGE: 'SYSTEM',
    
    // RGPD
    CONSENT_GIVEN: 'RGPD',
    CONSENT_WITHDRAWN: 'RGPD',
    DATA_PORTABILITY_REQUEST: 'RGPD',
    RIGHT_TO_ERASURE_REQUEST: 'RGPD',
    RIGHT_TO_RECTIFICATION_REQUEST: 'RGPD'
  };

  return categoryMap[actionType] || 'SYSTEM';
};

AuditLog.getSeverityFromActionType = function(actionType) {
  const severityMap = {
    // Actions critiques
    LOGIN_FAILED: 'HIGH',
    ACCOUNT_LOCKED: 'HIGH',
    SECURITY_ALERT: 'CRITICAL',
    SUSPICIOUS_ACTIVITY: 'CRITICAL',
    IP_BLOCKED: 'HIGH',
    DATA_DELETION: 'HIGH',
    DATA_ANONYMIZATION: 'HIGH',
    USER_DELETED: 'HIGH',
    PRODUCT_DELETED: 'HIGH',
    RIGHT_TO_ERASURE_REQUEST: 'HIGH',
    
    // Actions importantes
    PASSWORD_CHANGE: 'MEDIUM',
    PASSWORD_RESET: 'MEDIUM',
    ACCOUNT_UNLOCKED: 'MEDIUM',
    DATA_EXPORT: 'MEDIUM',
    PRIVACY_PREFERENCES_UPDATE: 'MEDIUM',
    ORDER_CANCELLED: 'MEDIUM',
    PAYMENT_FAILED: 'MEDIUM',
    USER_ROLE_CHANGED: 'MEDIUM',
    RATE_LIMIT_EXCEEDED: 'MEDIUM',
    CONSENT_WITHDRAWN: 'MEDIUM',
    DATA_PORTABILITY_REQUEST: 'MEDIUM',
    RIGHT_TO_RECTIFICATION_REQUEST: 'MEDIUM',
    
    // Actions normales
    LOGIN_SUCCESS: 'LOW',
    LOGOUT: 'LOW',
    DATA_ACCESS: 'LOW',
    ORDER_CREATED: 'LOW',
    ORDER_MODIFIED: 'LOW',
    PAYMENT_PROCESSED: 'LOW',
    PRODUCT_CREATED: 'LOW',
    PRODUCT_MODIFIED: 'LOW',
    STOCK_MODIFIED: 'LOW',
    USER_CREATED: 'LOW',
    USER_MODIFIED: 'LOW',
    SYSTEM_BACKUP: 'LOW',
    SYSTEM_MAINTENANCE: 'LOW',
    CONFIGURATION_CHANGE: 'LOW',
    CONSENT_GIVEN: 'LOW'
  };

  return severityMap[actionType] || 'MEDIUM';
};

AuditLog.getRetentionFromSeverity = function(severity) {
  const retentionMap = {
    CRITICAL: '3_YEARS',
    HIGH: '1_YEAR',
    MEDIUM: '90_DAYS',
    LOW: '30_DAYS'
  };

  return retentionMap[severity] || '1_YEAR';
};

// Méthodes d'instance
AuditLog.prototype.isCritical = function() {
  return this.action_severity === 'CRITICAL';
};

AuditLog.prototype.isHighSeverity = function() {
  return this.action_severity === 'HIGH' || this.action_severity === 'CRITICAL';
};

AuditLog.prototype.isSecurityRelated = function() {
  return this.action_category === 'SECURITY' || this.action_category === 'AUTHENTICATION';
};

AuditLog.prototype.isDataProtectionRelated = function() {
  return this.action_category === 'DATA_PROTECTION' || this.action_category === 'RGPD';
};

AuditLog.prototype.getRetentionDate = function() {
  const retentionDays = {
    '30_DAYS': 30,
    '90_DAYS': 90,
    '1_YEAR': 365,
    '3_YEARS': 1095,
    'INDEFINITE': null
  };

  const days = retentionDays[this.retention_period];
  if (!days) return null;

  const retentionDate = new Date(this.created_at);
  retentionDate.setDate(retentionDate.getDate() + days);
  return retentionDate;
};

AuditLog.prototype.shouldBeArchived = function() {
  const retentionDate = this.getRetentionDate();
  if (!retentionDate) return false;
  
  return new Date() > retentionDate;
};

// Définir les associations
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = AuditLog; 