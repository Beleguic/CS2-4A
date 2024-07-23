const { Model, DataTypes } = require('sequelize');
const { sendPriceChangeAlerts } = require('../services/notificationService');

module.exports = function (sequelize) {
  class Product extends Model {
    static associate(models) {
      Product.hasMany(models.CategoryProduct, {
        foreignKey: 'product_id',
        as: 'categoryProducts',
        onDelete: 'CASCADE'
      });

      Product.hasMany(models.Stock, {
        foreignKey: 'product_id',
        as: 'stocks',
        onDelete: 'CASCADE'
      });

      Product.hasMany(models.ProductPromotion, {
        foreignKey: 'product_id',
        as: 'productPromotions',
        onDelete: 'CASCADE'
      });

      Product.hasMany(models.PromotionCode, {
        foreignKey: 'product_id',
        as: 'promotionCodes',
        onDelete: 'CASCADE'
      });

      // Association with Category through CategoryProduct
      Product.belongsToMany(models.Category, {
        through: models.CategoryProduct,
        foreignKey: 'product_id',
        otherKey: 'category_id',
        as: 'categories'
      });
    }
  }

  Product.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_adult: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    reference: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tva: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: false,
  });

  Product.afterUpdate(async (product, options) => {
    if (product._previousDataValues.price !== product.price) {
      await sendPriceChangeAlerts(product);
    }
  });

  return Product;
};
