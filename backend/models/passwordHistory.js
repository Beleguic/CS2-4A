const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {

  class PasswordHistory extends Model { }

  PasswordHistory.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      field: 'user_id'
    },
    hashedPassword: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'hashed_password'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    }
  }, {
    sequelize: connection,
    modelName: 'PasswordHistory',
    tableName: 'password_history',
    timestamps: false,
    underscored: true
  });


  return PasswordHistory;
};