const { User, PasswordHistory } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

class PasswordRotationService {
  /**
   * Vérifier si un nouveau mot de passe peut être utilisé
   */
  static async validateNewPassword(userId, newPassword, checkHistory = true) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      const validationResults = {
        isValid: true,
        errors: [],
        warnings: []
      };

      // 1. Vérifier que le nouveau mot de passe est différent de l'actuel
      const isSameAsCurrent = await bcrypt.compare(newPassword, user.password);
      if (isSameAsCurrent) {
        validationResults.isValid = false;
        validationResults.errors.push('Le nouveau mot de passe doit être différent de l\'actuel');
      }

      // 2. Vérifier l'historique des mots de passe si demandé
      if (checkHistory) {
        const isRecentlyUsed = await PasswordHistory.isPasswordRecentlyUsed(userId, newPassword, 5);
        if (isRecentlyUsed) {
          validationResults.isValid = false;
          validationResults.errors.push('Ce mot de passe a été utilisé récemment. Veuillez choisir un nouveau mot de passe');
        }
      }

      // 3. Vérifier la complexité du mot de passe
      const complexityCheck = this.checkPasswordComplexity(newPassword);
      if (!complexityCheck.isValid) {
        validationResults.isValid = false;
        validationResults.errors.push(...complexityCheck.errors);
      }

      // 4. Vérifier la force du mot de passe
      const strengthCheck = this.checkPasswordStrength(newPassword);
      if (strengthCheck.score < 3) {
        validationResults.warnings.push('Ce mot de passe pourrait être plus fort');
      }

      return {
        ...validationResults,
        strength: strengthCheck.score,
        strengthDetails: strengthCheck.details
      };
    } catch (error) {
      console.error('Erreur lors de la validation du mot de passe:', error);
      throw error;
    }
  }

  /**
   * Changer le mot de passe avec rotation
   */
  static async rotatePassword(userId, newPassword, forceRotation = false) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Validation du nouveau mot de passe
      const validation = await this.validateNewPassword(userId, newPassword, true);
      if (!validation.isValid && !forceRotation) {
        throw new Error(`Mot de passe invalide: ${validation.errors.join(', ')}`);
      }

      // Sauvegarder l'ancien mot de passe dans l'historique
      await PasswordHistory.create({
        user_id: userId,
        password_hash: user.password,
        changed_at: new Date()
      });

      // Mettre à jour le mot de passe de l'utilisateur
      await user.updatePassword(newPassword);

      // Nettoyer l'historique ancien (garder seulement les 10 derniers)
      await PasswordHistory.cleanupOldHistory(userId, 10);

      console.log(`Mot de passe changé avec succès pour l'utilisateur ${user.email}`);

      return {
        success: true,
        message: 'Mot de passe changé avec succès',
        strength: validation.strength,
        strengthDetails: validation.strengthDetails
      };
    } catch (error) {
      console.error('Erreur lors de la rotation du mot de passe:', error);
      throw error;
    }
  }

  /**
   * Vérifier la complexité du mot de passe
   */
  static checkPasswordComplexity(password) {
    const errors = [];
    
    if (password.length < 12) {
      errors.push('Le mot de passe doit contenir au moins 12 caractères');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Évaluer la force du mot de passe
   */
  static checkPasswordStrength(password) {
    let score = 0;
    const details = {
      length: password.length,
      hasLowercase: /[a-z]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasNumbers: /[0-9]/.test(password),
      hasSpecialChars: /[^a-zA-Z0-9]/.test(password),
      hasRepeatingChars: /(.)\1{2,}/.test(password),
      hasSequentialChars: /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|012)/i.test(password)
    };

    // Points pour la longueur
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    if (password.length >= 20) score += 1;

    // Points pour les types de caractères
    if (details.hasLowercase) score += 1;
    if (details.hasUppercase) score += 1;
    if (details.hasNumbers) score += 1;
    if (details.hasSpecialChars) score += 1;

    // Pénalités
    if (details.hasRepeatingChars) score -= 1;
    if (details.hasSequentialChars) score -= 1;

    // Score final (0-7)
    score = Math.max(0, Math.min(7, score));

    return {
      score,
      details,
      level: score < 3 ? 'faible' : score < 5 ? 'moyen' : 'fort'
    };
  }

  /**
   * Obtenir l'historique des mots de passe d'un utilisateur
   */
  static async getPasswordHistory(userId, limit = 10) {
    try {
      const history = await PasswordHistory.getUserPasswordHistory(userId, limit);
      
      return history.map(record => ({
        id: record.id,
        changedAt: record.changed_at,
        changedAtFormatted: record.changed_at.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un utilisateur doit changer son mot de passe
   */
  static async shouldForcePasswordChange(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Vérifier l'expiration du mot de passe
      const isExpired = user.isPasswordExpired();
      const isExpiringSoon = user.isPasswordExpiringSoon();
      const forceChange = user.force_password_change;

      return {
        shouldChange: isExpired || forceChange,
        isExpired,
        isExpiringSoon,
        forceChange,
        daysUntilExpiration: user.getDaysUntilPasswordExpiration(),
        expirationDate: user.getPasswordExpirationDate()
      };
    } catch (error) {
      console.error('Erreur lors de la vérification du changement forcé:', error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques de rotation des mots de passe
   */
  static async getPasswordRotationStats() {
    try {
      const totalUsers = await User.count();
      const usersWithExpiredPasswords = await User.count({
        where: {
          password_last_changed: {
            [Op.lte]: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 jours
          }
        }
      });

      const usersWithExpiringPasswords = await User.count({
        where: {
          password_last_changed: {
            [Op.lte]: new Date(Date.now() - 53 * 24 * 60 * 60 * 1000), // 53 jours
            [Op.gt]: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)  // 60 jours
          }
        }
      });

      const usersWithForceChange = await User.count({
        where: { force_password_change: true }
      });

      return {
        totalUsers,
        usersWithExpiredPasswords,
        usersWithExpiringPasswords,
        usersWithForceChange,
        expiredPercentage: totalUsers > 0 ? ((usersWithExpiredPasswords / totalUsers) * 100).toFixed(2) : 0,
        expiringPercentage: totalUsers > 0 ? ((usersWithExpiringPasswords / totalUsers) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques de rotation:', error);
      throw error;
    }
  }

  /**
   * Nettoyer l'historique des mots de passe pour tous les utilisateurs
   */
  static async cleanupAllPasswordHistory(keepCount = 10) {
    try {
      const users = await User.findAll({
        attributes: ['id']
      });

      let totalCleaned = 0;
      for (const user of users) {
        await PasswordHistory.cleanupOldHistory(user.id, keepCount);
        totalCleaned++;
      }

      console.log(`Nettoyage de l'historique terminé pour ${totalCleaned} utilisateurs`);
      return totalCleaned;
    } catch (error) {
      console.error('Erreur lors du nettoyage global de l\'historique:', error);
      throw error;
    }
  }
}

module.exports = PasswordRotationService; 