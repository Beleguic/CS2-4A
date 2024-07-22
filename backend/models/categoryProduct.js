const { Model, DataTypes } = require('sequelize');
const { sendNewProductAlerts } = require('../services/notificationService');

module.exports = function (sequelize) {
  class CategoryProduct extends Model {
    static associate(models) {
      CategoryProduct.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
        onDelete: 'CASCADE'
      });
      CategoryProduct.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
        onDelete: 'CASCADE'
      });
    }
  }

  CategoryProduct.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
    }
  }, {
    sequelize,
    modelName: 'CategoryProduct',
    tableName: 'category_products',
    timestamps: false,
  });

  CategoryProduct.afterCreate(async (categoryProduct, options) => {
    await sendNewProductAlerts(categoryProduct);
  });

  return CategoryProduct;
};
