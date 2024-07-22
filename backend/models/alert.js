const { Model, DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  class Alert extends Model {
    static associate(models) {
      Alert.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
        onDelete: 'CASCADE'
      });
      Alert.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
        onDelete: 'CASCADE'
      });
      Alert.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE'
      });
      Alert.belongsTo(models.AlertType, {
        foreignKey: 'alert_type_id',
        as: 'alertType',
        onDelete: 'CASCADE'
      });
    }
  }

  Alert.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    alert_type_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'alert_types',
        key: 'id',
      },
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'Alert',
    tableName: 'alerts',
    timestamps: false,
  });

  return Alert;
};
