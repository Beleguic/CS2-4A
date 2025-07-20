const { z } = require('zod');

/**
 * Utilitaires de validation renforcée pour Tropicool
 * Fonctions utilitaires pour la validation côté serveur
 */
class ValidationUtils {
  /**
   * Valider et nettoyer une chaîne de caractères
   */
  static sanitizeString(value, maxLength = 255) {
    if (typeof value !== 'string') {
      throw new Error('La valeur doit être une chaîne de caractères');
    }

    // Supprimer les caractères dangereux
    let sanitized = value
      .replace(/[<>]/g, '') // Supprimer < et >
      .replace(/javascript:/gi, '') // Supprimer javascript:
      .replace(/on\w+=/gi, '') // Supprimer les événements onclick, onload, etc.
      .trim();

    // Limiter la longueur
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  /**
   * Valider et nettoyer un email
   */
  static sanitizeEmail(email) {
    const emailSchema = z.string()
      .email('Format d\'email invalide')
      .min(1, 'L\'email est requis')
      .max(255, 'L\'email ne peut pas dépasser 255 caractères')
      .transform(val => val.toLowerCase().trim());

    return emailSchema.parse(email);
  }

  /**
   * Valider et nettoyer un mot de passe
   */
  static validatePassword(password) {
    const passwordSchema = z.string()
      .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
      .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
        'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial');

    return passwordSchema.parse(password);
  }

  /**
   * Valider et nettoyer un nom d'utilisateur
   */
  static sanitizeUsername(username) {
    const usernameSchema = z.string()
      .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
      .max(50, 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères')
      .regex(/^[a-zA-Z0-9_-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores')
      .transform(val => val.toLowerCase().trim());

    return usernameSchema.parse(username);
  }

  /**
   * Valider et nettoyer un numéro de téléphone français
   */
  static sanitizePhone(phone) {
    const phoneSchema = z.string()
      .regex(/^(\+33|0)[1-9](\d{8})$/, 'Format de téléphone invalide')
      .transform(val => {
        // Normaliser le format
        if (val.startsWith('0')) {
          return '+33' + val.substring(1);
        }
        return val;
      });

    return phoneSchema.parse(phone);
  }

  /**
   * Valider et nettoyer un code postal français
   */
  static sanitizePostalCode(postalCode) {
    const postalCodeSchema = z.string()
      .regex(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres')
      .transform(val => val.trim());

    return postalCodeSchema.parse(postalCode);
  }

  /**
   * Valider et nettoyer une URL
   */
  static sanitizeUrl(url) {
    const urlSchema = z.string()
      .url('L\'URL doit être valide')
      .max(500, 'L\'URL ne peut pas dépasser 500 caractères')
      .transform(val => {
        // S'assurer que l'URL commence par http:// ou https://
        if (!val.startsWith('http://') && !val.startsWith('https://')) {
          return 'https://' + val;
        }
        return val;
      });

    return urlSchema.parse(url);
  }

  /**
   * Valider et nettoyer un prix
   */
  static sanitizePrice(price) {
    const priceSchema = z.number()
      .positive('Le prix doit être positif')
      .min(0.01, 'Le prix minimum est de 0.01')
      .max(999999.99, 'Le prix maximum est de 999999.99')
      .transform(val => Math.round(val * 100) / 100); // Arrondir à 2 décimales

    return priceSchema.parse(price);
  }

  /**
   * Valider et nettoyer une quantité
   */
  static sanitizeQuantity(quantity) {
    const quantitySchema = z.number()
      .int('La quantité doit être un nombre entier')
      .min(0, 'La quantité ne peut pas être négative')
      .max(999999, 'La quantité maximum est de 999999');

    return quantitySchema.parse(quantity);
  }

  /**
   * Valider et nettoyer un pourcentage
   */
  static sanitizePercentage(percentage) {
    const percentageSchema = z.number()
      .min(0, 'Le pourcentage ne peut pas être négatif')
      .max(100, 'Le pourcentage ne peut pas dépasser 100%')
      .transform(val => Math.round(val * 100) / 100); // Arrondir à 2 décimales

    return percentageSchema.parse(percentage);
  }

  /**
   * Valider et nettoyer une date
   */
  static sanitizeDate(date) {
    const dateSchema = z.union([
      z.string().datetime('Format de date invalide'),
      z.date()
    ]).transform(val => {
      if (typeof val === 'string') {
        return new Date(val);
      }
      return val;
    });

    return dateSchema.parse(date);
  }

  /**
   * Valider et nettoyer un objet d'adresse
   */
  static sanitizeAddress(address) {
    const addressSchema = z.object({
      street: z.string()
        .min(1, 'L\'adresse est requise')
        .max(255, 'L\'adresse ne peut pas dépasser 255 caractères')
        .transform(val => this.sanitizeString(val, 255)),
      city: z.string()
        .min(1, 'La ville est requise')
        .max(100, 'La ville ne peut pas dépasser 100 caractères')
        .transform(val => this.sanitizeString(val, 100)),
      postal_code: z.string()
        .transform(val => this.sanitizePostalCode(val)),
      country: z.string()
        .min(1, 'Le pays est requis')
        .max(100, 'Le pays ne peut pas dépasser 100 caractères')
        .transform(val => this.sanitizeString(val, 100))
    });

    return addressSchema.parse(address);
  }

  /**
   * Valider et nettoyer un objet de pagination
   */
  static sanitizePagination(query) {
    const paginationSchema = z.object({
      page: z.string()
        .regex(/^\d+$/, 'Le numéro de page doit être un nombre')
        .transform(Number)
        .default('1'),
      limit: z.string()
        .regex(/^\d+$/, 'La limite doit être un nombre')
        .transform(Number)
        .default('10')
    }).transform(data => ({
      page: Math.max(1, data.page),
      limit: Math.min(100, Math.max(1, data.limit))
    }));

    return paginationSchema.parse(query);
  }

  /**
   * Valider et nettoyer un objet de filtres de recherche
   */
  static sanitizeSearchFilters(query) {
    const searchFiltersSchema = z.object({
      search: z.string()
        .max(100, 'Le terme de recherche ne peut pas dépasser 100 caractères')
        .transform(val => this.sanitizeString(val, 100))
        .optional(),
      category: z.string()
        .regex(/^\d+$/, 'L\'ID de catégorie doit être un nombre')
        .transform(Number)
        .optional(),
      minPrice: z.string()
        .regex(/^\d+(\.\d+)?$/, 'Le prix minimum doit être un nombre')
        .transform(val => this.sanitizePrice(Number(val)))
        .optional(),
      maxPrice: z.string()
        .regex(/^\d+(\.\d+)?$/, 'Le prix maximum doit être un nombre')
        .transform(val => this.sanitizePrice(Number(val)))
        .optional(),
      sortBy: z.enum(['name', 'price', 'created_at'])
        .default('created_at'),
      sortOrder: z.enum(['asc', 'desc'])
        .default('desc')
    });

    return searchFiltersSchema.parse(query);
  }

  /**
   * Valider et nettoyer un objet de filtres de date
   */
  static sanitizeDateFilters(query) {
    const dateFiltersSchema = z.object({
      startDate: z.string()
        .datetime('Format de date invalide')
        .transform(val => this.sanitizeDate(val))
        .optional(),
      endDate: z.string()
        .datetime('Format de date invalide')
        .transform(val => this.sanitizeDate(val))
        .optional()
    }).refine((data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    }, {
      message: 'La date de début doit être antérieure à la date de fin',
      path: ['endDate']
    });

    return dateFiltersSchema.parse(query);
  }

  /**
   * Valider et nettoyer un objet de filtres d'audit
   */
  static sanitizeAuditFilters(query) {
    const auditFiltersSchema = z.object({
      userId: z.string()
        .regex(/^\d+$/, 'L\'ID utilisateur doit être un nombre')
        .transform(Number)
        .optional(),
      actionType: z.string()
        .max(50, 'Le type d\'action ne peut pas dépasser 50 caractères')
        .transform(val => this.sanitizeString(val, 50))
        .optional(),
      actionCategory: z.enum(['AUTHENTICATION', 'DATA_PROTECTION', 'ORDER_MANAGEMENT', 'PRODUCT_MANAGEMENT', 'USER_MANAGEMENT', 'SECURITY', 'SYSTEM', 'RGPD'])
        .optional(),
      actionSeverity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
        .optional(),
      resourceType: z.string()
        .max(50, 'Le type de ressource ne peut pas dépasser 50 caractères')
        .transform(val => this.sanitizeString(val, 50))
        .optional(),
      resourceId: z.string()
        .max(50, 'L\'ID de ressource ne peut pas dépasser 50 caractères')
        .transform(val => this.sanitizeString(val, 50))
        .optional(),
      ipAddress: z.string()
        .ip('Format d\'adresse IP invalide')
        .optional()
    });

    return auditFiltersSchema.parse(query);
  }

  /**
   * Valider et nettoyer un objet d'export
   */
  static sanitizeExportOptions(query) {
    const exportOptionsSchema = z.object({
      format: z.enum(['json', 'csv', 'xml'])
        .default('json'),
      includeMetadata: z.string()
        .transform(val => val === 'true')
        .default('true'),
      includeSchema: z.string()
        .transform(val => val === 'true')
        .default('true'),
      compression: z.string()
        .transform(val => val === 'true')
        .default('true')
    });

    return exportOptionsSchema.parse(query);
  }

  /**
   * Valider et nettoyer un objet de préférences de confidentialité
   */
  static sanitizePrivacyPreferences(data) {
    const privacyPreferencesSchema = z.object({
      privacy_level: z.enum(['strict', 'moderate', 'permissive'])
        .default('moderate'),
      
      // Cookies et tracking
      accept_essential_cookies: z.boolean()
        .default(true),
      accept_analytics_cookies: z.boolean()
        .default(false),
      accept_marketing_cookies: z.boolean()
        .default(false),
      accept_third_party_cookies: z.boolean()
        .default(false),
      
      // Communications et marketing
      receive_email_marketing: z.boolean()
        .default(false),
      receive_sms_marketing: z.boolean()
        .default(false),
      receive_push_notifications: z.boolean()
        .default(false),
      receive_newsletter: z.boolean()
        .default(false),
      
      // Partage de données
      share_data_analytics: z.boolean()
        .default(false),
      share_data_research: z.boolean()
        .default(false),
      share_data_partners: z.boolean()
        .default(false),
      
      // Profil et visibilité
      profile_visibility: z.enum(['public', 'friends', 'private'])
        .default('private'),
      show_email_public: z.boolean()
        .default(false),
      show_phone_public: z.boolean()
        .default(false),
      show_address_public: z.boolean()
        .default(false),
      
      // Historique et données
      save_search_history: z.boolean()
        .default(true),
      save_browsing_history: z.boolean()
        .default(true),
      save_purchase_history: z.boolean()
        .default(true),
      
      // Géolocalisation
      allow_location_tracking: z.boolean()
        .default(false),
      allow_location_services: z.boolean()
        .default(false),
      
      // Personnalisation
      allow_personalization: z.boolean()
        .default(false),
      allow_recommendations: z.boolean()
        .default(false),
      allow_targeted_ads: z.boolean()
        .default(false),
      
      // Rétention des données
      data_retention_period: z.enum(['30_days', '90_days', '1_year', '3_years', 'indefinite'])
        .default('1_year'),
      auto_delete_inactive: z.boolean()
        .default(true),
      
      // Notifications de sécurité
      security_notifications: z.boolean()
        .default(true),
      privacy_notifications: z.boolean()
        .default(true)
    });

    return privacyPreferencesSchema.parse(data);
  }

  /**
   * Valider et nettoyer un objet de données sensibles
   */
  static sanitizeSensitiveData(data) {
    // Supprimer les champs sensibles
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'apiKey'];
    const sanitized = { ...data };

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[SENSIBLE]';
      }
    });

    return sanitized;
  }

  /**
   * Valider et nettoyer un objet de données SQL
   */
  static sanitizeSQLData(data) {
    // Protection contre les injections SQL basiques
    const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER', 'EXEC', 'UNION'];
    const sanitized = { ...data };

    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        const upperValue = sanitized[key].toUpperCase();
        if (sqlKeywords.some(keyword => upperValue.includes(keyword))) {
          throw new Error(`Valeur non autorisée détectée dans le champ ${key}`);
        }
      }
    });

    return sanitized;
  }

  /**
   * Valider et nettoyer un objet de données XSS
   */
  static sanitizeXSSData(data) {
    // Protection contre les attaques XSS basiques
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi
    ];

    const sanitized = { ...data };

    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        xssPatterns.forEach(pattern => {
          if (pattern.test(sanitized[key])) {
            throw new Error(`Contenu dangereux détecté dans le champ ${key}`);
          }
        });
      }
    });

    return sanitized;
  }

  /**
   * Valider et nettoyer un objet complet avec toutes les protections
   */
  static sanitizeComplete(data) {
    let sanitized = data;

    // Appliquer toutes les sanitisations
    sanitized = this.sanitizeSensitiveData(sanitized);
    sanitized = this.sanitizeSQLData(sanitized);
    sanitized = this.sanitizeXSSData(sanitized);

    return sanitized;
  }
}

module.exports = ValidationUtils; 