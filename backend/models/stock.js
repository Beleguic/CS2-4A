const { Model, DataTypes } = require('sequelize');
const { sendRestockAlerts } = require('../services/notificationService');

module.exports = function (sequelize) {
  class Stock extends Model {
    static associate(models) {
      Stock.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
        onDelete: 'CASCADE'
      });
    }
  }

  Stock.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.STRING,
    },
    difference: {
      type: DataTypes.STRING,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'Stock',
    tableName: 'stocks',
    timestamps: false,
  });

  Stock.afterCreate(async (stock, options) => {
    await sendRestockAlerts(stock);
  });

  return Stock;
};
