const bcrypt = require('bcryptjs');
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class User extends Model {
    static async hashPassword(password) {
      const salt = await bcrypt.genSalt();
      return bcrypt.hash(password, salt);
    }

    // Vérifier si le mot de passe a expiré (60 jours)
    isPasswordExpired() {
      if (!this.password_last_changed) {
        return true; // Pas de mot de passe défini
      }
      
      const expirationDate = new Date(this.password_last_changed);
      expirationDate.setDate(expirationDate.getDate() + 60); // 60 jours
      
      return new Date() > expirationDate;
    }

    // Vérifier si le mot de passe expire bientôt (7 jours avant)
    isPasswordExpiringSoon() {
      if (!this.password_last_changed) {
        return false;
      }
      
      const expirationDate = new Date(this.password_last_changed);
      expirationDate.setDate(expirationDate.getDate() + 60); // 60 jours
      
      const warningDate = new Date(expirationDate);
      warningDate.setDate(warningDate.getDate() - 7); // 7 jours avant
      
      return new Date() >= warningDate && new Date() < expirationDate;
    }

    // Obtenir la date d'expiration du mot de passe
    getPasswordExpirationDate() {
      if (!this.password_last_changed) {
        return null;
      }
      
      const expirationDate = new Date(this.password_last_changed);
      expirationDate.setDate(expirationDate.getDate() + 60);
      return expirationDate;
    }

    // Obtenir le nombre de jours restants avant expiration
    getDaysUntilPasswordExpiration() {
      if (!this.password_last_changed) {
        return 0;
      }
      
      const expirationDate = this.getPasswordExpirationDate();
      const now = new Date();
      const diffTime = expirationDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return Math.max(0, diffDays);
    }

    // Mettre à jour le mot de passe et réinitialiser l'expiration
    async updatePassword(newPassword) {
      this.password = await User.hashPassword(newPassword);
      this.password_last_changed = new Date();
      this.password_expires_at = this.getPasswordExpirationDate();
      this.password_expiration_warning_sent = false;
      this.force_password_change = false;
      
      // Enregistrer l'historique des mots de passe
      const { PasswordHistory } = require('./index');
      await PasswordHistory.create({
        user_id: this.id,
        password_hash: this.password,
        changed_at: new Date()
      });
      
      return this.save();
    }

    // Gestion des tentatives de connexion échouées
    isAccountLocked() {
      return this.lock_until && this.lock_until > new Date();
    }

    getLockRemainingTime() {
      if (!this.isAccountLocked()) {
        return 0;
      }
      return Math.ceil((this.lock_until - new Date()) / (1000 * 60)); // Minutes
    }

    incrementLoginAttempts() {
      this.login_attempts = (this.login_attempts || 0) + 1;
      
      // Temporisation progressive : 2h, 4h, 8h, 24h
      const lockDurations = [2, 4, 8, 24]; // heures
      const attemptIndex = Math.min(this.login_attempts - 1, lockDurations.length - 1);
      
      if (this.login_attempts >= 3) {
        const lockDurationHours = lockDurations[attemptIndex];
        this.lock_until = new Date(Date.now() + lockDurationHours * 60 * 60 * 1000);
      }
      
      return this.save();
    }

    resetLoginAttempts() {
      this.login_attempts = 0;
      this.lock_until = null;
      return this.save();
    }

    shouldSendLockNotification() {
      // Envoyer une notification seulement à la 3ème tentative
      return this.login_attempts === 3;
    }

    getNextLockDuration() {
      const lockDurations = [2, 4, 8, 24]; // heures
      const attemptIndex = Math.min(this.login_attempts, lockDurations.length - 1);
      return lockDurations[attemptIndex];
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
    password_expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    password_expiration_warning_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    force_password_change: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
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
    // Champs pour l'anonymisation RGPD
    is_anonymized: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    anonymized_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    anonymization_reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    original_email_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    original_data_backup: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recreation_allowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    recreation_requested_at: {
      type: DataTypes.DATE,
      allowNull: true,
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
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        user.password = await User.hashPassword(user.password);
        user.password_last_changed = new Date();
        user.password_expires_at = user.getPasswordExpirationDate();
      },
      beforeUpdate: async (user, options) => {
        if (options.fields.includes('password')) {
          user.password = await User.hashPassword(user.password);
          user.password_last_changed = new Date();
          user.password_expires_at = user.getPasswordExpirationDate();
          user.password_expiration_warning_sent = false;
          user.force_password_change = false;
        }
        user.updated_at = new Date();
      }
    },
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return User;
};
