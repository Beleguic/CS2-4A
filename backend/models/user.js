// Existing imports
const bcrypt = require('bcryptjs');
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static async hashPassword(password) {
      const salt = await bcrypt.genSalt();
      return bcrypt.hash(password, salt);
    }

    static associate(models) {
      User.hasMany(models.PasswordHistory, {
        foreignKey: 'user_id',
        as: 'passwordHistories',
        onDelete: 'CASCADE'
      });
      User.hasMany(models.Newsletter, {
        foreignKey: 'user_id',
        as: 'newsletters',
        onDelete: 'CASCADE'
      });
      User.hasMany(models.Order, {
        foreignKey: 'user_id',
        as: 'orders',
        onDelete: 'CASCADE'
      });
      User.hasMany(models.Cart, {
        foreignKey: 'user_id',
        as: 'carts',
        onDelete: 'CASCADE'
      });
      User.hasMany(models.Alert, {
        foreignKey: 'user_id',
        as: 'alerts',
        onDelete: 'CASCADE'
      });
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Email cannot be null'
        },
        isEmail: {
          msg: 'Email is invalid'
        }
      }
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Date of birth cannot be null'
        },
        isDate: {
          msg: 'Date of birth must be a valid date'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Password cannot be null'
        }
      }
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
    verification_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lock_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_password_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    password_last_changed: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Username cannot be null'
        }
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'First name cannot be null'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Last name cannot be null'
        }
      }
    },
    isSubscribedToNewsletter: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    deletion_requested_at: { 
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        user.password = await User.hashPassword(user.password);
      },
      beforeUpdate: async (user, options) => {
        if (options.fields.includes('password')) {
          user.password = await User.hashPassword(user.password);
        }
        user.updated_at = new Date();
      }
    },
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return User;
};
