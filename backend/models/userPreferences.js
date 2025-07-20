const { DataTypes } = require('sequelize');
const { sequelize } = require('./db');

const UserPreferences = sequelize.define('UserPreferences', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },

  // Préférences de confidentialité générales
  privacy_level: {
    type: DataTypes.ENUM('strict', 'moderate', 'permissive'),
    defaultValue: 'moderate',
    allowNull: false,
    comment: 'Niveau de confidentialité général de l\'utilisateur'
  },

  // Cookies et tracking
  accept_essential_cookies: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Accepte les cookies essentiels (obligatoire)'
  },

  accept_analytics_cookies: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Accepte les cookies d\'analyse'
  },

  accept_marketing_cookies: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Accepte les cookies marketing'
  },

  accept_third_party_cookies: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Accepte les cookies tiers'
  },

  // Communications et marketing
  receive_email_marketing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Accepte de recevoir des emails marketing'
  },

  receive_sms_marketing: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Accepte de recevoir des SMS marketing'
  },

  receive_push_notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Accepte les notifications push'
  },

  receive_newsletter: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Accepte de recevoir la newsletter'
  },

  // Partage de données
  share_data_analytics: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Autorise le partage de données pour l\'analyse'
  },

  share_data_research: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Autorise le partage de données pour la recherche'
  },

  share_data_partners: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Autorise le partage de données avec les partenaires'
  },

  // Profil et visibilité
  profile_visibility: {
    type: DataTypes.ENUM('public', 'friends', 'private'),
    defaultValue: 'private',
    allowNull: false,
    comment: 'Visibilité du profil utilisateur'
  },

  show_email_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Affiche l\'email publiquement'
  },

  show_phone_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Affiche le téléphone publiquement'
  },

  show_address_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Affiche l\'adresse publiquement'
  },

  // Historique et données
  save_search_history: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Sauvegarde l\'historique de recherche'
  },

  save_browsing_history: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Sauvegarde l\'historique de navigation'
  },

  save_purchase_history: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Sauvegarde l\'historique d\'achat'
  },

  // Géolocalisation
  allow_location_tracking: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Autorise le suivi de géolocalisation'
  },

  allow_location_services: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Autorise les services de géolocalisation'
  },

  // Personnalisation
  allow_personalization: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Autorise la personnalisation du contenu'
  },

  allow_recommendations: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Autorise les recommandations personnalisées'
  },

  allow_targeted_ads: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Autorise la publicité ciblée'
  },

  // Rétention des données
  data_retention_period: {
    type: DataTypes.ENUM('30_days', '90_days', '1_year', '3_years', 'indefinite'),
    defaultValue: '1_year',
    allowNull: false,
    comment: 'Période de rétention des données personnelles'
  },

  auto_delete_inactive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Suppression automatique des données inactives'
  },

  // Notifications de sécurité
  security_notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Reçoit les notifications de sécurité'
  },

  privacy_notifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    comment: 'Reçoit les notifications de confidentialité'
  },

  // Consentement et audit
  consent_given_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Date du dernier consentement donné'
  },

  consent_version: {
    type: DataTypes.STRING,
    defaultValue: '1.0',
    allowNull: false,
    comment: 'Version du consentement acceptée'
  },

  last_updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Date de dernière mise à jour des préférences'
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
  tableName: 'user_preferences',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  
  indexes: [
    {
      unique: true,
      fields: ['user_id']
    },
    {
      fields: ['privacy_level']
    },
    {
      fields: ['consent_given_at']
    }
  ],

  hooks: {
    beforeUpdate: (preferences) => {
      preferences.last_updated_at = new Date();
    }
  }
});

// Méthodes d'instance
UserPreferences.prototype.isStrictPrivacy = function() {
  return this.privacy_level === 'strict';
};

UserPreferences.prototype.isModeratePrivacy = function() {
  return this.privacy_level === 'moderate';
};

UserPreferences.prototype.isPermissivePrivacy = function() {
  return this.privacy_level === 'permissive';
};

UserPreferences.prototype.hasValidConsent = function() {
  return this.consent_given_at !== null;
};

UserPreferences.prototype.canReceiveMarketing = function() {
  return this.receive_email_marketing || this.receive_sms_marketing;
};

UserPreferences.prototype.canTrackAnalytics = function() {
  return this.accept_analytics_cookies && this.share_data_analytics;
};

UserPreferences.prototype.canPersonalize = function() {
  return this.allow_personalization && this.allow_recommendations;
};

// Méthodes de classe
UserPreferences.getDefaultPreferences = function() {
  return {
    privacy_level: 'moderate',
    accept_essential_cookies: true,
    accept_analytics_cookies: false,
    accept_marketing_cookies: false,
    accept_third_party_cookies: false,
    receive_email_marketing: false,
    receive_sms_marketing: false,
    receive_push_notifications: false,
    receive_newsletter: false,
    share_data_analytics: false,
    share_data_research: false,
    share_data_partners: false,
    profile_visibility: 'private',
    show_email_public: false,
    show_phone_public: false,
    show_address_public: false,
    save_search_history: true,
    save_browsing_history: true,
    save_purchase_history: true,
    allow_location_tracking: false,
    allow_location_services: false,
    allow_personalization: false,
    allow_recommendations: false,
    allow_targeted_ads: false,
    data_retention_period: '1_year',
    auto_delete_inactive: true,
    security_notifications: true,
    privacy_notifications: true,
    consent_version: '1.0'
  };
};

UserPreferences.getStrictPreferences = function() {
  return {
    privacy_level: 'strict',
    accept_essential_cookies: true,
    accept_analytics_cookies: false,
    accept_marketing_cookies: false,
    accept_third_party_cookies: false,
    receive_email_marketing: false,
    receive_sms_marketing: false,
    receive_push_notifications: false,
    receive_newsletter: false,
    share_data_analytics: false,
    share_data_research: false,
    share_data_partners: false,
    profile_visibility: 'private',
    show_email_public: false,
    show_phone_public: false,
    show_address_public: false,
    save_search_history: false,
    save_browsing_history: false,
    save_purchase_history: true,
    allow_location_tracking: false,
    allow_location_services: false,
    allow_personalization: false,
    allow_recommendations: false,
    allow_targeted_ads: false,
    data_retention_period: '30_days',
    auto_delete_inactive: true,
    security_notifications: true,
    privacy_notifications: true,
    consent_version: '1.0'
  };
};

module.exports = UserPreferences; 