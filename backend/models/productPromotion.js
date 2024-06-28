const { Model, DataTypes, Sequelize } = require('sequelize');

module.exports = function (sequelize) {
  class ProductPromotion extends Model {}

  ProductPromotion.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    start_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    end_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'ProductPromotion',
    tableName: 'product_promotions',
    timestamps: false,
  });

  return ProductPromotion;
};
