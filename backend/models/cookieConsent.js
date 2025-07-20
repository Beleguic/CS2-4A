const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class CookieConsent extends Model {
    static associate(models) {
      CookieConsent.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE'
      });
    }
  }

  CookieConsent.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true, // Peut être null pour les utilisateurs non connectés
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    session_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ID de session pour les utilisateurs non connectés'
    },
    essential: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Consentement pour les cookies essentiels'
    },
    analytics: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Consentement pour les cookies analytics'
    },
    marketing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Consentement pour les cookies marketing'
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Adresse IP de l\'utilisateur'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User agent du navigateur'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'CookieConsent',
    tableName: 'cookie_consents',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['session_id']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return CookieConsent;
}; 