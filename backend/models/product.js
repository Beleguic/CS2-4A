const { Model, DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  class Product extends Model {
    static associate(models) {
      // Association with CategoryProduct
      Product.hasMany(models.CategoryProduct, {
        foreignKey: 'product_id',
        as: 'categoryProducts',
        onDelete: 'CASCADE'
      });

      // Association with Stock
      Product.hasMany(models.Stock, {
        foreignKey: 'product_id',
        as: 'stocks',
        onDelete: 'CASCADE'
      });

      // Association with ProductPromotion
      Product.hasMany(models.ProductPromotion, {
        foreignKey: 'product_id',
        as: 'productPromotions',
        onDelete: 'CASCADE'
      });

      // Association with PromotionCode
      Product.hasMany(models.PromotionCode, {
        foreignKey: 'product_id',
        as: 'promotionCodes',
        onDelete: 'CASCADE'
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
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: 'Product',
    tableName: 'products',
    timestamps: false,
  });

  return Product;
};
