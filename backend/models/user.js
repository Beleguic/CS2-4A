const bcrypt = require('bcryptjs');
const { Model, DataTypes } = require('sequelize');

module.exports = function (connection) {

  class User extends Model {

    static addHooks(models){
      User.addHook('beforeCreate', async (user) => {
        user.password = await bcrypt.hash(
          user.password,
          await bcrypt.genSalt()
        );
      });
      User.addHook('beforeUpdate', async (user, { fields }) => {
        if (fields.includes("password"))
        user.password = await bcrypt.hash(
          user.password,
          await bcrypt.genSalt()
        );
      });
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user'
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_verified'
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'verification_token'
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'login_attempts'
    },
    lockUntil: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'lock_until'
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'reset_password_token'
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reset_password_expires'
    },
    passwordLastChanged: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'password_last_changed'
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize: connection,
    modelName: 'User',
    timestamps: false,
    tableName: 'users'
  });
  return User;
};
