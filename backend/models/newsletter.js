const { Model, DataTypes, Sequelize } = require('sequelize');

module.exports = function (sequelize) {
        class Newsletter extends Model {}

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
