const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {

class UserHistory extends Model {}

UserHistory.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'user'
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  password_last_changed: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deleted_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize: connection,
  modelName: 'UserHistory',
  tableName: 'user_history',
  timestamps: false

  });


  return PasswordHistory;
};