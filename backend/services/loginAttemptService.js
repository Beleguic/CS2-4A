const { User } = require('../models');
const mailService = require('./mailService');
const { Op } = require('sequelize');

class LoginAttemptService {
  /**
   * Gérer une tentative de connexion échouée
   */
  static async handleFailedLoginAttempt(email) {
    try {
      const user = await User.findOne({
        where: { email: email.toLowerCase().trim() }
      });

      if (!user) {
        // Pour les emails inexistants, on ne fait rien
        return {
          shouldLock: false,
          remainingAttempts: 0,
          lockDuration: 0
        };
      }

      // Incrémenter les tentatives
      await user.incrementLoginAttempts();

      // Vérifier si le compte doit être verrouillé
      const shouldLock = user.login_attempts >= 3;
      const remainingAttempts = Math.max(0, 3 - user.login_attempts);
      const lockDuration = shouldLock ? user.getNextLockDuration() : 0;

      // Envoyer une notification si c'est la 3ème tentative
      if (user.shouldSendLockNotification()) {
        await this.sendAccountLockedEmail(user);
      }

      console.log(`Tentative de connexion échouée pour ${email}. Tentatives: ${user.login_attempts}`);

      return {
        shouldLock,
        remainingAttempts,
        lockDuration,
        lockUntil: user.lock_until
      };
    } catch (error) {
      console.error('Erreur lors de la gestion de la tentative échouée:', error);
      throw error;
    }
  }

  /**
   * Gérer une connexion réussie
   */
  static async handleSuccessfulLogin(email) {
    try {
      const user = await User.findOne({
        where: { email: email.toLowerCase().trim() }
      });

      if (user && user.login_attempts > 0) {
        await user.resetLoginAttempts();
        console.log(`Connexion réussie pour ${email}. Tentatives réinitialisées.`);
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la gestion de la connexion réussie:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un compte est verrouillé
   */
  static async isAccountLocked(email) {
    try {
      const user = await User.findOne({
        where: { email: email.toLowerCase().trim() }
      });

      if (!user) {
        return { locked: false, remainingTime: 0 };
      }

      const locked = user.isAccountLocked();
      const remainingTime = user.getLockRemainingTime();

      return { locked, remainingTime };
    } catch (error) {
      console.error('Erreur lors de la vérification du verrouillage:', error);
      throw error;
    }
  }

  /**
   * Déverrouiller manuellement un compte
   */
  static async unlockAccount(email) {
    try {
      const user = await User.findOne({
        where: { email: email.toLowerCase().trim() }
      });

      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      await user.resetLoginAttempts();

      // Envoyer un email de notification de déverrouillage
      await this.sendAccountUnlockedEmail(user);

      console.log(`Compte déverrouillé manuellement pour ${email}`);
      
      return true;
    } catch (error) {
      console.error('Erreur lors du déverrouillage du compte:', error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques des tentatives de connexion
   */
  static async getLoginAttemptStats() {
    try {
      const stats = await User.findAll({
        where: {
          [Op.or]: [
            { login_attempts: { [Op.gt]: 0 } },
            { lock_until: { [Op.gt]: new Date() } }
          ]
        },
        attributes: [
          'id', 'email', 'username', 'firstName', 'lastName',
          'login_attempts', 'lock_until', 'created_at'
        ]
      });

      return stats.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        loginAttempts: user.login_attempts,
        isLocked: user.isAccountLocked(),
        lockUntil: user.lock_until,
        remainingTime: user.getLockRemainingTime(),
        createdAt: user.created_at
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  /**
   * Nettoyer les verrouillages expirés
   */
  static async cleanupExpiredLocks() {
    try {
      const expiredUsers = await User.findAll({
        where: {
          lock_until: {
            [Op.lt]: new Date()
          }
        }
      });

      for (const user of expiredUsers) {
        await user.resetLoginAttempts();
      }

      console.log(`${expiredUsers.length} verrouillages expirés nettoyés`);
      
      return expiredUsers.length;
    } catch (error) {
      console.error('Erreur lors du nettoyage des verrouillages:', error);
      throw error;
    }
  }

  /**
   * Envoyer un email de notification de verrouillage
   */
  static async sendAccountLockedEmail(user) {
    try {
      const lockDuration = user.getNextLockDuration();
      const lockUntil = user.lock_until;
      const formattedLockUntil = lockUntil.toLocaleString('fr-FR', { 
        timeZone: 'Europe/Paris',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const emailData = {
        to: user.email,
        subject: '🔒 Compte Temporairement Verrouillé - Tropicool',
        template: 'accountLocked',
        context: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          loginAttempts: user.login_attempts,
          lockDuration,
          lockUntil: formattedLockUntil,
          unlockUrl: `${process.env.FRONTEND_URL}/unlock-account`
        }
      };

      await mailService.sendEmail(emailData);
      
      console.log(`Email de verrouillage envoyé à ${user.email}`);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email de verrouillage à ${user.email}:`, error);
      return false;
    }
  }

  /**
   * Envoyer un email de notification de déverrouillage
   */
  static async sendAccountUnlockedEmail(user) {
    try {
      const emailData = {
        to: user.email,
        subject: '🔓 Compte Déverrouillé - Tropicool',
        template: 'accountUnlocked',
        context: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          loginUrl: `${process.env.FRONTEND_URL}/login`
        }
      };

      await mailService.sendEmail(emailData);
      
      console.log(`Email de déverrouillage envoyé à ${user.email}`);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email de déverrouillage à ${user.email}:`, error);
      return false;
    }
  }

  /**
   * Envoyer un email d'alerte de sécurité
   */
  static async sendSecurityAlertEmail(user, attemptDetails) {
    try {
      const emailData = {
        to: user.email,
        subject: '⚠️ Alerte de Sécurité - Tropicool',
        template: 'securityAlert',
        context: {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          attemptDetails,
          loginUrl: `${process.env.FRONTEND_URL}/login`,
          supportEmail: 'support@tropicool.fr'
        }
      };

      await mailService.sendEmail(emailData);
      
      console.log(`Email d'alerte de sécurité envoyé à ${user.email}`);
      
      return true;
    } catch (error) {
      console.error(`Erreur lors de l'envoi de l'email d'alerte à ${user.email}:`, error);
      return false;
    }
  }

  /**
   * Obtenir les tentatives de connexion récentes
   */
  static async getRecentLoginAttempts(limit = 50) {
    try {
      const users = await User.findAll({
        where: {
          [Op.or]: [
            { login_attempts: { [Op.gt]: 0 } },
            { lock_until: { [Op.gt]: new Date() } }
          ]
        },
        order: [['lock_until', 'DESC'], ['login_attempts', 'DESC']],
        limit,
        attributes: [
          'id', 'email', 'username', 'firstName', 'lastName',
          'login_attempts', 'lock_until', 'updated_at'
        ]
      });

      return users.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: `${user.firstName} ${user.lastName}`,
        loginAttempts: user.login_attempts,
        isLocked: user.isAccountLocked(),
        lockUntil: user.lock_until,
        remainingTime: user.getLockRemainingTime(),
        lastUpdated: user.updated_at
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des tentatives récentes:', error);
      throw error;
    }
  }
}

module.exports = LoginAttemptService; 