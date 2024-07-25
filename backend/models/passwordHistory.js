const bcrypt = require('bcryptjs');
const { Model, DataTypes, Sequelize } = require('sequelize');

module.exports = function (sequelize) {
  class PasswordHistory extends Model {
    static async hashPassword(password) {
      const salt = await bcrypt.genSalt();
      return bcrypt.hash(password, salt);
    }

    static associate(models) {
      PasswordHistory.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user',
        onDelete: 'CASCADE',
      });
    }
  }

  PasswordHistory.init({
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
    hashed_password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'PasswordHistory',
    tableName: 'password_histories',
    timestamps: false,
    underscored: true,
    hooks: {
      beforeCreate: async (passwordHistory) => {
        passwordHistory.hashed_password = await PasswordHistory.hashPassword(passwordHistory.hashed_password);
      }
    }
  });

  return PasswordHistory;
};
