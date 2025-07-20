const { ZodError } = require('zod');

/**
 * Middleware de validation uniforme utilisant Zod
 * Remplace les validations Joi dispersées dans les contrôleurs
 */
class ValidationMiddleware {
  /**
   * Middleware de validation générique
   * @param {z.ZodSchema} schema - Le schéma Zod à utiliser pour la validation
   * @param {string} target - 'body', 'query', 'params' ou 'all'
   * @returns {Function} Middleware Express
   */
  static validate(schema, target = 'body') {
    return (req, res, next) => {
      try {
        let dataToValidate;

        switch (target) {
          case 'body':
            dataToValidate = req.body;
            break;
          case 'query':
            dataToValidate = req.query;
            break;
          case 'params':
            dataToValidate = req.params;
            break;
          case 'all':
            dataToValidate = {
              body: req.body,
              query: req.query,
              params: req.params
            };
            break;
          default:
            dataToValidate = req.body;
        }

        // Valider les données avec le schéma Zod
        const validatedData = schema.parse(dataToValidate);

        // Stocker les données validées dans la requête
        switch (target) {
          case 'body':
            req.validatedBody = validatedData;
            break;
          case 'query':
            req.validatedQuery = validatedData;
            break;
          case 'params':
            req.validatedParams = validatedData;
            break;
          case 'all':
            req.validatedData = validatedData;
            break;
        }

        next();

      } catch (error) {
        if (error instanceof ZodError) {
          // Formater les erreurs Zod pour l'API
          const formattedErrors = this.formatZodErrors(error);
          
          return res.status(400).json({
            success: false,
            error: 'Données de validation invalides',
            details: formattedErrors,
            message: 'Veuillez corriger les erreurs de validation'
          });
        }

        // Erreur inattendue
        console.error('❌ Erreur de validation:', error);
        return res.status(500).json({
          success: false,
          error: 'Erreur interne de validation',
          message: 'Une erreur est survenue lors de la validation des données'
        });
      }
    };
  }

  /**
   * Middleware de validation pour l'authentification
   */
  static validateLogin() {
    const { loginSchema } = require('../validations/schemas');
    return this.validate(loginSchema, 'body');
  }

  static validateRegister() {
    const { registerSchema } = require('../validations/schemas');
    return this.validate(registerSchema, 'body');
  }

  static validateResetPassword() {
    const { resetPasswordSchema } = require('../validations/schemas');
    return this.validate(resetPasswordSchema, 'body');
  }

  static validateNewPassword() {
    const { newPasswordSchema } = require('../validations/schemas');
    return this.validate(newPasswordSchema, 'body');
  }

  static validateChangePassword() {
    const { changePasswordSchema } = require('../validations/schemas');
    return this.validate(changePasswordSchema, 'body');
  }

  /**
   * Middleware de validation pour les produits
   */
  static validateProduct() {
    const { productSchema } = require('../validations/schemas');
    return this.validate(productSchema, 'body');
  }

  static validateProductUpdate() {
    const { productUpdateSchema } = require('../validations/schemas');
    return this.validate(productUpdateSchema, 'body');
  }

  static validateProductQuery() {
    const { productQuerySchema } = require('../validations/schemas');
    return this.validate(productQuerySchema, 'query');
  }

  /**
   * Middleware de validation pour les catégories
   */
  static validateCategory() {
    const { categorySchema } = require('../validations/schemas');
    return this.validate(categorySchema, 'body');
  }

  static validateCategoryUpdate() {
    const { categoryUpdateSchema } = require('../validations/schemas');
    return this.validate(categoryUpdateSchema, 'body');
  }

  /**
   * Middleware de validation pour les commandes
   */
  static validateOrder() {
    const { orderSchema } = require('../validations/schemas');
    return this.validate(orderSchema, 'body');
  }

  static validateOrderUpdate() {
    const { orderUpdateSchema } = require('../validations/schemas');
    return this.validate(orderUpdateSchema, 'body');
  }

  /**
   * Middleware de validation pour le panier
   */
  static validateCartItem() {
    const { cartItemSchema } = require('../validations/schemas');
    return this.validate(cartItemSchema, 'body');
  }

  static validateCartUpdate() {
    const { cartUpdateSchema } = require('../validations/schemas');
    return this.validate(cartUpdateSchema, 'body');
  }

  /**
   * Middleware de validation pour les utilisateurs
   */
  static validateUser() {
    const { userSchema } = require('../validations/schemas');
    return this.validate(userSchema, 'body');
  }

  static validateUserUpdate() {
    const { userUpdateSchema } = require('../validations/schemas');
    return this.validate(userUpdateSchema, 'body');
  }

  /**
   * Middleware de validation pour les préférences de confidentialité
   */
  static validatePrivacyPreferences() {
    const { privacyPreferencesSchema } = require('../validations/schemas');
    return this.validate(privacyPreferencesSchema, 'body');
  }

  /**
   * Middleware de validation pour les promotions
   */
  static validatePromotionCode() {
    const { promotionCodeSchema } = require('../validations/schemas');
    return this.validate(promotionCodeSchema, 'body');
  }

  static validatePromotionCodeUpdate() {
    const { promotionCodeUpdateSchema } = require('../validations/schemas');
    return this.validate(promotionCodeUpdateSchema, 'body');
  }

  /**
   * Middleware de validation pour le stock
   */
  static validateStock() {
    const { stockSchema } = require('../validations/schemas');
    return this.validate(stockSchema, 'body');
  }

  static validateStockUpdate() {
    const { stockUpdateSchema } = require('../validations/schemas');
    return this.validate(stockUpdateSchema, 'body');
  }

  /**
   * Middleware de validation pour les alertes
   */
  static validateAlert() {
    const { alertSchema } = require('../validations/schemas');
    return this.validate(alertSchema, 'body');
  }

  static validateAlertUpdate() {
    const { alertUpdateSchema } = require('../validations/schemas');
    return this.validate(alertUpdateSchema, 'body');
  }

  /**
   * Middleware de validation pour la newsletter
   */
  static validateNewsletter() {
    const { newsletterSchema } = require('../validations/schemas');
    return this.validate(newsletterSchema, 'body');
  }

  /**
   * Middleware de validation pour la pagination
   */
  static validatePagination() {
    const { paginationSchema } = require('../validations/schemas');
    return this.validate(paginationSchema, 'query');
  }

  /**
   * Middleware de validation pour les filtres de date
   */
  static validateDateRange() {
    const { dateRangeSchema } = require('../validations/schemas');
    return this.validate(dateRangeSchema, 'query');
  }

  /**
   * Middleware de validation pour les exports
   */
  static validateExport() {
    const { exportSchema } = require('../validations/schemas');
    return this.validate(exportSchema, 'query');
  }

  /**
   * Middleware de validation pour les filtres d'audit
   */
  static validateAuditFilter() {
    const { auditFilterSchema } = require('../validations/schemas');
    return this.validate(auditFilterSchema, 'query');
  }

  /**
   * Middleware de validation pour les IDs numériques
   */
  static validateId() {
    const idSchema = require('zod').object({
      id: require('zod').string()
        .regex(/^\d+$/, 'L\'ID doit être un nombre')
        .transform(Number)
    });
    return this.validate(idSchema, 'params');
  }

  /**
   * Middleware de validation pour les IDs multiples
   */
  static validateIds() {
    const idsSchema = require('zod').object({
      ids: require('zod').string()
        .regex(/^\d+(,\d+)*$/, 'Les IDs doivent être des nombres séparés par des virgules')
        .transform(str => str.split(',').map(Number))
    });
    return this.validate(idsSchema, 'query');
  }

  /**
   * Middleware de validation pour les emails
   */
  static validateEmail() {
    const emailSchema = require('zod').object({
      email: require('zod').string()
        .email('Format d\'email invalide')
        .min(1, 'L\'email est requis')
    });
    return this.validate(emailSchema, 'body');
  }

  /**
   * Middleware de validation pour les tokens
   */
  static validateToken() {
    const tokenSchema = require('zod').object({
      token: require('zod').string()
        .min(1, 'Le token est requis')
    });
    return this.validate(tokenSchema, 'body');
  }

  /**
   * Middleware de validation pour les mots de passe
   */
  static validatePassword() {
    const passwordSchema = require('zod').object({
      password: require('zod').string()
        .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
          'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial')
    });
    return this.validate(passwordSchema, 'body');
  }

  /**
   * Formater les erreurs Zod pour l'API
   */
  static formatZodErrors(zodError) {
    const errors = {};

    zodError.errors.forEach(error => {
      const field = error.path.join('.');
      errors[field] = {
        message: error.message,
        code: error.code,
        received: error.received
      };
    });

    return errors;
  }

  /**
   * Middleware de validation conditionnelle
   * @param {Function} condition - Fonction qui retourne true si la validation doit être appliquée
   * @param {z.ZodSchema} schema - Le schéma Zod à utiliser
   * @param {string} target - 'body', 'query', 'params'
   */
  static validateIf(condition, schema, target = 'body') {
    return (req, res, next) => {
      if (condition(req)) {
        return this.validate(schema, target)(req, res, next);
      }
      next();
    };
  }

  /**
   * Middleware de validation avec transformation
   * @param {z.ZodSchema} schema - Le schéma Zod à utiliser
   * @param {string} target - 'body', 'query', 'params'
   * @param {Function} transform - Fonction de transformation à appliquer après validation
   */
  static validateAndTransform(schema, target = 'body', transform = null) {
    return (req, res, next) => {
      try {
        let dataToValidate;

        switch (target) {
          case 'body':
            dataToValidate = req.body;
            break;
          case 'query':
            dataToValidate = req.query;
            break;
          case 'params':
            dataToValidate = req.params;
            break;
          default:
            dataToValidate = req.body;
        }

        // Valider les données
        const validatedData = schema.parse(dataToValidate);

        // Appliquer la transformation si fournie
        const finalData = transform ? transform(validatedData) : validatedData;

        // Stocker les données finales
        switch (target) {
          case 'body':
            req.validatedBody = finalData;
            break;
          case 'query':
            req.validatedQuery = finalData;
            break;
          case 'params':
            req.validatedParams = finalData;
            break;
        }

        next();

      } catch (error) {
        if (error instanceof ZodError) {
          const formattedErrors = this.formatZodErrors(error);
          
          return res.status(400).json({
            success: false,
            error: 'Données de validation invalides',
            details: formattedErrors,
            message: 'Veuillez corriger les erreurs de validation'
          });
        }

        console.error('❌ Erreur de validation:', error);
        return res.status(500).json({
          success: false,
          error: 'Erreur interne de validation',
          message: 'Une erreur est survenue lors de la validation des données'
        });
      }
    };
  }

  /**
   * Middleware de validation avec sanitisation
   * @param {z.ZodSchema} schema - Le schéma Zod à utiliser
   * @param {string} target - 'body', 'query', 'params'
   */
  static validateAndSanitize(schema, target = 'body') {
    return this.validateAndTransform(schema, target, (data) => {
      // Fonction de sanitisation basique
      return JSON.parse(JSON.stringify(data));
    });
  }
}

module.exports = ValidationMiddleware; 