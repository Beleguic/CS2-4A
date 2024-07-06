const { Model, DataTypes } = require('sequelize');

module.exports = function (sequelize) {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.CategoryProduct, {
        foreignKey: 'category_id',
        as: 'categoryProducts',
        onDelete: 'CASCADE'
      });

      Category.hasMany(models.PromotionCode, {
        foreignKey: 'category_id',
        as: 'promotionCodes',
        onDelete: 'CASCADE'
      });

      Category.hasMany(models.Alert, {
        foreignKey: 'category_id',
        as: 'alerts',
        onDelete: 'CASCADE'
      });
    }
  }

  Category.init({
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
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
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
    modelName: 'Category',
    tableName: 'categories',
    timestamps: false,
  });

  return Category;
};
