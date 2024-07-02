const bcrypt = require('bcryptjs');
const { Model, DataTypes, Sequelize } = require('sequelize');

module.exports = function (sequelize) {
  class UserHistory extends Model {
    static async hashPassword(password) {
      const salt = await bcrypt.genSalt();
      return bcrypt.hash(password, salt);
    }
  }

  UserHistory.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    password_last_changed: {
      type: DataTypes.DATE,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'UserHistory',
    tableName: 'user_histories',
    timestamps: false,
    hooks: {
      beforeCreate: async (userHistory) => {
        userHistory.password = await UserHistory.hashPassword(userHistory.password);
      }
    }
  });

  return UserHistory;
};
