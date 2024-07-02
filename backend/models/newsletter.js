const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Newsletter extends Model {
    static associate(models) {
      Newsletter.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE'
      });
    }
  }

  Newsletter.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'Newsletter',
    tableName: 'newsletters',
    timestamps: false,
  });

  return Newsletter;
};
