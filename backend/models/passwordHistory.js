const bcrypt = require('bcryptjs');
const { Model, DataTypes, Sequelize } = require('sequelize');

module.exports = function (sequelize) {
  class PasswordHistory extends Model {
    static async hashPassword(password) {
      const salt = await bcrypt.genSalt();
      return bcrypt.hash(password, salt);
    }

    // Vérifier si un mot de passe a été utilisé récemment
    static async isPasswordRecentlyUsed(userId, newPassword, limit = 5) {
      try {
        const recentPasswords = await PasswordHistory.findAll({
          where: { user_id: userId },
          order: [['changed_at', 'DESC']],
          limit: limit,
          attributes: ['password_hash']
        });

        for (const passwordRecord of recentPasswords) {
          const isMatch = await bcrypt.compare(newPassword, passwordRecord.password_hash);
          if (isMatch) {
            return true;
          }
        }

        return false;
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'historique des mots de passe:', error);
        throw error;
      }
    }

    // Obtenir l'historique des mots de passe d'un utilisateur
    static async getUserPasswordHistory(userId, limit = 10) {
      try {
        return await PasswordHistory.findAll({
          where: { user_id: userId },
          order: [['changed_at', 'DESC']],
          limit: limit,
          attributes: ['id', 'changed_at']
        });
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique des mots de passe:', error);
        throw error;
      }
    }

    // Nettoyer l'historique ancien (garder seulement les 10 derniers)
    static async cleanupOldHistory(userId, keepCount = 10) {
      try {
        const allHistory = await PasswordHistory.findAll({
          where: { user_id: userId },
          order: [['changed_at', 'DESC']],
          attributes: ['id']
        });

        if (allHistory.length > keepCount) {
          const toDelete = allHistory.slice(keepCount);
          const idsToDelete = toDelete.map(record => record.id);

          await PasswordHistory.destroy({
            where: {
              id: {
                [Sequelize.Op.in]: idsToDelete
              }
            }
          });

          console.log(`${idsToDelete.length} anciens mots de passe supprimés pour l'utilisateur ${userId}`);
        }
      } catch (error) {
        console.error('Erreur lors du nettoyage de l\'historique des mots de passe:', error);
        throw error;
      }
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
    password_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    changed_at: {
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
        passwordHistory.password_hash = await PasswordHistory.hashPassword(passwordHistory.password_hash);
      }
    }
  });

  return PasswordHistory;
};
