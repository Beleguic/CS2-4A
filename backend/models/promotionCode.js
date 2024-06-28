const { Model, DataTypes, Sequelize } = require('sequelize');

module.exports = function (sequelize) {
        class PromotionCode extends Model {}

  PromotionCode.init({
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
    category_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id',
      },
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
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
    modelName: 'PromotionCode',
    tableName: 'promotion_codes',
    timestamps: false,
  });

  return PromotionCode;
};
