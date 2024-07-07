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
    }
  }

  Alert.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    alert_type_id: {
      type: DataTypes.INTEGER,
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
