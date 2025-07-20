const { User } = require('../models');
const { sendEmail } = require('./mailService');
const { Op } = require('sequelize');

class PasswordExpirationService {
  /**
   * Vérifier et traiter l'expiration des mots de passe
   */
  static async checkPasswordExpirations() {
    try {
      console.log('🔄 Vérification de l\'expiration des mots de passe...');
      
      const now = new Date();
      const expirationDate = new Date(now);
      expirationDate.setDate(expirationDate.getDate() + 60); // 60 jours
      
      // Trouver les utilisateurs avec des mots de passe expirés
      const expiredUsers = await User.findAll({
        where: {
          password_last_changed: {
            [Op.lte]: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) // 60 jours
          },
          force_password_change: false // Pas déjà forcé
        },
        attributes: ['id', 'email', 'first_name', 'last_name', 'password_last_changed']
      });

      console.log(`📊 ${expiredUsers.length} utilisateurs avec des mots de passe expirés trouvés`);

      // Forcer le changement de mot de passe pour les utilisateurs expirés
      for (const user of expiredUsers) {
        await this.forcePasswordChange(user.id);
        await this.sendPasswordExpiredEmail(user);
      }

      // Trouver les utilisateurs avec des mots de passe expirant bientôt
      const warningDate = new Date(now);
      warningDate.setDate(warningDate.getDate() + 53); // 7 jours avant expiration
      
      const expiringUsers = await User.findAll({
        where: {
          password_last_changed: {
            [Op.lte]: warningDate,
            [Op.gt]: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000) // Pas encore expiré
          },
          password_expiration_warning_sent: false // Pas encore averti
        },
        attributes: ['id', 'email', 'first_name', 'last_name', 'password_last_changed']
      });

      console.log(`📊 ${expiringUsers.length} utilisateurs avec des mots de passe expirant bientôt trouvés`);

      // Envoyer les avertissements
      for (const user of expiringUsers) {
        await this.sendPasswordExpirationWarning(user);
        await this.markWarningSent(user.id);
      }

      return {
        expiredCount: expiredUsers.length,
        expiringCount: expiringUsers.length,
        totalProcessed: expiredUsers.length + expiringUsers.length
      };
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'expiration:', error);
      throw error;
    }
  }

  /**
   * Forcer le changement de mot de passe pour un utilisateur
   */
  static async forcePasswordChange(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      user.force_password_change = true;
      await user.save();

      console.log(`🔒 Changement de mot de passe forcé pour l'utilisateur ${user.email}`);
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors du forçage du changement de mot de passe:', error);
      throw error;
    }
  }

  /**
   * Envoyer un email d'avertissement d'expiration
   */
  static async sendPasswordExpirationWarning(user) {
    try {
      const daysUntilExpiration = user.getDaysUntilPasswordExpiration();
      const expirationDate = user.getPasswordExpirationDate();

      const emailData = {
        to: user.email,
        subject: '⚠️ Votre mot de passe expire bientôt - Tropicool',
        template: 'passwordExpirationWarning',
        context: {
          firstName: user.first_name,
          lastName: user.last_name,
          daysUntilExpiration,
          expirationDate: expirationDate.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          changePasswordUrl: `${process.env.FRONTEND_URL}/profile?forceChange=true`
        }
      };

      await sendEmail(emailData);
      console.log(`📧 Avertissement d'expiration envoyé à ${user.email}`);

    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de l'avertissement à ${user.email}:`, error);
    }
  }

  /**
   * Envoyer un email de mot de passe expiré
   */
  static async sendPasswordExpiredEmail(user) {
    try {
      const emailData = {
        to: user.email,
        subject: '🔒 Votre mot de passe a expiré - Tropicool',
        template: 'passwordExpired',
        context: {
          firstName: user.first_name,
          lastName: user.last_name,
          changePasswordUrl: `${process.env.FRONTEND_URL}/profile?forceChange=true`,
          supportEmail: process.env.SUPPORT_EMAIL || 'support@tropicool.com'
        }
      };

      await sendEmail(emailData);
      console.log(`📧 Email d'expiration envoyé à ${user.email}`);

    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi de l'email d'expiration à ${user.email}:`, error);
    }
  }

  /**
   * Marquer qu'un avertissement a été envoyé
   */
  static async markWarningSent(userId) {
    try {
      const user = await User.findByPk(userId);
      if (user) {
        user.password_expiration_warning_sent = true;
        await user.save();
      }
    } catch (error) {
      console.error('❌ Erreur lors du marquage de l\'avertissement:', error);
    }
  }

  /**
   * Obtenir les statistiques d'expiration des mots de passe
   */
  static async getExpirationStats() {
    try {
      const now = new Date();
      const totalUsers = await User.count();
      
      // Utilisateurs avec des mots de passe expirés
      const expiredUsers = await User.count({
        where: {
          password_last_changed: {
            [Op.lte]: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
          }
        }
      });

      // Utilisateurs avec des mots de passe expirant bientôt (7 jours)
      const warningDate = new Date(now);
      warningDate.setDate(warningDate.getDate() + 53);
      
      const expiringUsers = await User.count({
        where: {
          password_last_changed: {
            [Op.lte]: warningDate,
            [Op.gt]: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
          }
        }
      });

      // Utilisateurs avec changement forcé
      const forcedChangeUsers = await User.count({
        where: { force_password_change: true }
      });

      // Utilisateurs avec des mots de passe récents (moins de 30 jours)
      const recentUsers = await User.count({
        where: {
          password_last_changed: {
            [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });

      return {
        totalUsers,
        expiredUsers,
        expiringUsers,
        forcedChangeUsers,
        recentUsers,
        expiredPercentage: totalUsers > 0 ? ((expiredUsers / totalUsers) * 100).toFixed(2) : 0,
        expiringPercentage: totalUsers > 0 ? ((expiringUsers / totalUsers) * 100).toFixed(2) : 0,
        forcedChangePercentage: totalUsers > 0 ? ((forcedChangeUsers / totalUsers) * 100).toFixed(2) : 0,
        recentPercentage: totalUsers > 0 ? ((recentUsers / totalUsers) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques d\'expiration:', error);
      throw error;
    }
  }

  /**
   * Obtenir la liste des utilisateurs avec des mots de passe expirés
   */
  static async getExpiredUsers(limit = 50, offset = 0) {
    try {
      const now = new Date();
      
      const users = await User.findAll({
        where: {
          password_last_changed: {
            [Op.lte]: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
          }
        },
        attributes: [
          'id', 'email', 'first_name', 'last_name', 
          'password_last_changed', 'force_password_change',
          'password_expiration_warning_sent'
        ],
        order: [['password_last_changed', 'ASC']],
        limit,
        offset
      });

      return users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        passwordLastChanged: user.password_last_changed,
        daysExpired: Math.floor((now - user.password_last_changed) / (1000 * 60 * 60 * 24)),
        forcePasswordChange: user.force_password_change,
        warningSent: user.password_expiration_warning_sent
      }));
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs expirés:', error);
      throw error;
    }
  }

  /**
   * Réinitialiser l'expiration d'un mot de passe (admin)
   */
  static async resetPasswordExpiration(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      user.password_last_changed = new Date();
      user.force_password_change = false;
      user.password_expiration_warning_sent = false;
      await user.save();

      console.log(`🔄 Expiration du mot de passe réinitialisée pour ${user.email}`);
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la réinitialisation de l\'expiration:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un utilisateur peut se connecter (mot de passe non expiré)
   */
  static async canUserLogin(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return false;
      }

      // Vérifier si le compte est verrouillé
      if (user.isAccountLocked()) {
        return false;
      }

      // Vérifier si le mot de passe a expiré
      if (user.isPasswordExpired()) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de connexion:', error);
      return false;
    }
  }
}

module.exports = PasswordExpirationService; 