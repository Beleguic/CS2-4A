const { Model, DataTypes, Sequelize } = require('sequelize');

module.exports = function (sequelize) {
  class Alert extends Model {}

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
