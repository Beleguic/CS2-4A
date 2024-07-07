const { Model, DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  class PromotionCode extends Model {
    static associate(models) {
      PromotionCode.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
        onDelete: 'CASCADE'
      });

      PromotionCode.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
        onDelete: 'CASCADE'
      });
    }
  }

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
