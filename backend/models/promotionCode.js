const { DataTypes, Model } = require('sequelize');

module.exports = function (sequelize) {
  class PromotionCode extends Model { }

  PromotionCode.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reduction: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 100,
      }
    },
    start_at: {
      type: DataTypes.DATE,
    },
    end_at: {
      type: DataTypes.DATE,
    }
  }, {
    sequelize,
    modelName: 'PromotionCode',
    tableName: 'promotion_codes',
    timestamps: false,
  });

  return PromotionCode;
};
