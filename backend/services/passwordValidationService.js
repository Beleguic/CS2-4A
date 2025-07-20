const Joi = require('joi');

class PasswordValidationService {
  /**
   * Schéma de validation des mots de passe selon les exigences CNIL
   */
  static getPasswordSchema() {
    return Joi.string()
      .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
      .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une lettre minuscule')
      .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule')
      .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
      .regex(/[^a-zA-Z0-9]/, 'Le mot de passe doit contenir au moins un symbole spécial')
      .custom((value, helpers) => {
        // Vérifier qu'il n'y a pas de caractères répétés plus de 3 fois consécutivement
        for (let i = 0; i < value.length - 2; i++) {
          if (value[i] === value[i + 1] && value[i] === value[i + 2]) {
            return helpers.error('any.invalid', { 
              message: 'Le mot de passe ne doit pas contenir plus de 3 caractères identiques consécutifs' 
            });
          }
        }
        return value;
      })
      .custom((value, helpers) => {
        // Vérifier qu'il n'y a pas de séquences de caractères (123, abc, etc.)
        const sequences = [
          '123', '234', '345', '456', '567', '678', '789', '012',
          'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz'
        ];
        
        const lowerValue = value.toLowerCase();
        for (const seq of sequences) {
          if (lowerValue.includes(seq)) {
            return helpers.error('any.invalid', { 
              message: 'Le mot de passe ne doit pas contenir de séquences de caractères (123, abc, etc.)' 
            });
          }
        }
        return value;
      })
      .custom((value, helpers) => {
        // Vérifier qu'il n'y a pas de mots de passe trop communs
        const commonPasswords = [
          'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
          'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'sunshine',
          'princess', 'qwerty123', 'football', 'baseball', 'superman', 'trustno1'
        ];
        
        const lowerValue = value.toLowerCase();
        for (const common of commonPasswords) {
          if (lowerValue.includes(common)) {
            return helpers.error('any.invalid', { 
              message: 'Le mot de passe ne doit pas contenir de mots de passe trop communs' 
            });
          }
        }
        return value;
      });
  }

  /**
   * Schéma pour la validation d'inscription avec mot de passe CNIL
   */
  static getRegistrationSchema() {
    return Joi.object({
      firstName: Joi.string()
        .min(2, 'Le prénom doit contenir au moins 2 caractères')
        .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
        .pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes')
        .required()
        .messages({
          'string.empty': 'Le prénom est requis',
          'any.required': 'Le prénom est requis'
        }),
      
      lastName: Joi.string()
        .min(2, 'Le nom doit contenir au moins 2 caractères')
        .max(50, 'Le nom ne peut pas dépasser 50 caractères')
        .pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes')
        .required()
        .messages({
          'string.empty': 'Le nom est requis',
          'any.required': 'Le nom est requis'
        }),
      
      username: Joi.string()
        .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
        .max(30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères')
        .pattern(/^[a-zA-Z0-9_-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores')
        .required()
        .messages({
          'string.empty': 'Le nom d\'utilisateur est requis',
          'any.required': 'Le nom d\'utilisateur est requis'
        }),
      
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .max(255, 'L\'email ne peut pas dépasser 255 caractères')
        .required()
        .messages({
          'string.empty': 'L\'email est requis',
          'string.email': 'Format d\'email invalide',
          'any.required': 'L\'email est requis'
        }),
      
      password: this.getPasswordSchema()
        .required()
        .messages({
          'string.empty': 'Le mot de passe est requis',
          'any.required': 'Le mot de passe est requis'
        }),
      
      dateOfBirth: Joi.date()
        .max('now', 'La date de naissance ne peut pas être dans le futur')
        .min('1900-01-01', 'La date de naissance doit être après 1900')
        .required()
        .messages({
          'date.base': 'Format de date invalide',
          'date.max': 'La date de naissance ne peut pas être dans le futur',
          'date.min': 'La date de naissance doit être après 1900',
          'any.required': 'La date de naissance est requise'
        })
    }).options({ 
      stripUnknown: true,
      abortEarly: false 
    });
  }

  /**
   * Schéma pour le changement de mot de passe
   */
  static getChangePasswordSchema() {
    return Joi.object({
      currentPassword: Joi.string()
        .required()
        .messages({
          'string.empty': 'Le mot de passe actuel est requis',
          'any.required': 'Le mot de passe actuel est requis'
        }),
      
      newPassword: this.getPasswordSchema()
        .required()
        .messages({
          'string.empty': 'Le nouveau mot de passe est requis',
          'any.required': 'Le nouveau mot de passe est requis'
        }),
      
      confirmNewPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
          'string.empty': 'La confirmation du mot de passe est requise',
          'any.only': 'Les nouveaux mots de passe ne correspondent pas',
          'any.required': 'La confirmation du mot de passe est requise'
        })
    }).options({ 
      stripUnknown: true,
      abortEarly: false 
    });
  }

  /**
   * Valider un mot de passe selon les exigences CNIL
   */
  static validatePassword(password) {
    const schema = this.getPasswordSchema();
    const { error, value } = schema.validate(password);
    
    return {
      isValid: !error,
      errors: error ? error.details.map(detail => detail.message) : [],
      value
    };
  }

  /**
   * Évaluer la force d'un mot de passe
   */
  static evaluatePasswordStrength(password) {
    let score = 0;
    const feedback = [];

    // Longueur
    if (password.length >= 12) {
      score += 2;
    } else if (password.length >= 8) {
      score += 1;
      feedback.push('Augmentez la longueur du mot de passe');
    } else {
      feedback.push('Le mot de passe est trop court');
    }

    // Complexité
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;

    // Vérifications supplémentaires
    if (password.length >= 16) score += 1;
    if (/[^a-zA-Z0-9]{2,}/.test(password)) score += 1; // Plusieurs symboles consécutifs

    // Pénalités
    if (/(.)\1{2,}/.test(password)) {
      score -= 1;
      feedback.push('Évitez les caractères répétés');
    }

    if (/123|234|345|456|567|678|789|012|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz/i.test(password)) {
      score -= 1;
      feedback.push('Évitez les séquences de caractères');
    }

    // Déterminer le niveau
    let level;
    if (score <= 2) level = 'très faible';
    else if (score <= 4) level = 'faible';
    else if (score <= 6) level = 'moyen';
    else if (score <= 8) level = 'fort';
    else level = 'très fort';

    return {
      score: Math.max(0, Math.min(10, score)),
      level,
      feedback
    };
  }

  /**
   * Obtenir les exigences CNIL
   */
  static getCNILRequirements() {
    return {
      minLength: 12,
      requirements: [
        'Au moins 12 caractères',
        'Au moins une lettre minuscule (a-z)',
        'Au moins une lettre majuscule (A-Z)',
        'Au moins un chiffre (0-9)',
        'Au moins un symbole spécial (!@#$%^&*...)',
        'Pas plus de 3 caractères identiques consécutifs',
        'Pas de séquences de caractères (123, abc, etc.)',
        'Pas de mots de passe trop communs'
      ]
    };
  }

  /**
   * Valider les données d'inscription
   */
  static validateRegistration(data) {
    const schema = this.getRegistrationSchema();
    const { error, value } = schema.validate(data);
    
    return {
      isValid: !error,
      errors: error ? error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      })) : [],
      value
    };
  }

  /**
   * Valider le changement de mot de passe
   */
  static validateChangePassword(data) {
    const schema = this.getChangePasswordSchema();
    const { error, value } = schema.validate(data);
    
    return {
      isValid: !error,
      errors: error ? error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      })) : [],
      value
    };
  }
}

module.exports = PasswordValidationService; 