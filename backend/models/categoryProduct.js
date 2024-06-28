const { Model, DataTypes, Sequelize } = require('sequelize');

module.exports = function (sequelize) {
  class CategoryProduct extends Model {}

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

  return CategoryProduct;
};
