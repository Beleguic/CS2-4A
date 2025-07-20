const ValidationUtils = require('../utils/validationUtils');
const { ZodError } = require('zod');

/**
 * Middleware de validation côté serveur renforcée
 * Implémente des protections de sécurité avancées
 */
class SecurityValidationMiddleware {
  /**
   * Middleware de validation avec protection XSS
   */
  static validateAndSanitizeXSS(schema, target = 'body') {
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

        // Sanitisation XSS avant validation
        const sanitizedData = ValidationUtils.sanitizeXSSData(dataToValidate);

        // Validation avec le schéma Zod
        const validatedData = schema.parse(sanitizedData);

        // Stocker les données validées
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
        }

        next();

      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({
            success: false,
            error: 'Données de validation invalides',
            details: this.formatZodErrors(error),
            message: 'Veuillez corriger les erreurs de validation'
          });
        }

        console.error('❌ Erreur de validation XSS:', error);
        return res.status(500).json({
          success: false,
          error: 'Erreur interne de validation',
          message: 'Une erreur est survenue lors de la validation des données'
        });
      }
    };
  }

  /**
   * Middleware de validation avec protection SQL
   */
  static validateAndSanitizeSQL(schema, target = 'body') {
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

        // Sanitisation SQL avant validation
        const sanitizedData = ValidationUtils.sanitizeSQLData(dataToValidate);

        // Validation avec le schéma Zod
        const validatedData = schema.parse(sanitizedData);

        // Stocker les données validées
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
        }

        next();

      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({
            success: false,
            error: 'Données de validation invalides',
            details: this.formatZodErrors(error),
            message: 'Veuillez corriger les erreurs de validation'
          });
        }

        console.error('❌ Erreur de validation SQL:', error);
        return res.status(500).json({
          success: false,
          error: 'Erreur interne de validation',
          message: 'Une erreur est survenue lors de la validation des données'
        });
      }
    };
  }

  /**
   * Middleware de validation complète avec toutes les protections
   */
  static validateAndSanitizeComplete(schema, target = 'body') {
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

        // Sanitisation complète avant validation
        const sanitizedData = ValidationUtils.sanitizeComplete(dataToValidate);

        // Validation avec le schéma Zod
        const validatedData = schema.parse(sanitizedData);

        // Stocker les données validées
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
        }

        next();

      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({
            success: false,
            error: 'Données de validation invalides',
            details: this.formatZodErrors(error),
            message: 'Veuillez corriger les erreurs de validation'
          });
        }

        console.error('❌ Erreur de validation complète:', error);
        return res.status(500).json({
          success: false,
          error: 'Erreur interne de validation',
          message: 'Une erreur est survenue lors de la validation des données'
        });
      }
    };
  }

  /**
   * Middleware de validation avec rate limiting
   */
  static validateWithRateLimit(schema, target = 'body', maxRequests = 100, windowMs = 15 * 60 * 1000) {
    const requestCounts = new Map();

    return (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Nettoyer les anciennes entrées
      if (requestCounts.has(clientIP)) {
        const requests = requestCounts.get(clientIP).filter(time => time > windowStart);
        requestCounts.set(clientIP, requests);
      } else {
        requestCounts.set(clientIP, []);
      }

      const requests = requestCounts.get(clientIP);
      requests.push(now);

      if (requests.length > maxRequests) {
        return res.status(429).json({
          success: false,
          error: 'Trop de requêtes',
          message: 'Vous avez dépassé la limite de requêtes. Veuillez réessayer plus tard.',
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      // Validation normale
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

        const validatedData = schema.parse(dataToValidate);

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
        }

        next();

      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({
            success: false,
            error: 'Données de validation invalides',
            details: this.formatZodErrors(error),
            message: 'Veuillez corriger les erreurs de validation'
          });
        }

        console.error('❌ Erreur de validation avec rate limit:', error);
        return res.status(500).json({
          success: false,
          error: 'Erreur interne de validation',
          message: 'Une erreur est survenue lors de la validation des données'
        });
      }
    };
  }

  /**
   * Middleware de validation avec détection d'activités suspectes
   */
  static validateWithSuspiciousActivityDetection(schema, target = 'body') {
    return (req, res, next) => {
      const suspiciousFlags = [];

      // Détecter les patterns suspects
      const userAgent = req.get('User-Agent') || '';
      const contentType = req.get('Content-Type') || '';
      const contentLength = parseInt(req.get('Content-Length') || '0');

      // Détecter les bots
      if (userAgent.toLowerCase().includes('bot') || userAgent.toLowerCase().includes('crawler')) {
        suspiciousFlags.push('BOT_DETECTED');
      }

      // Détecter les requêtes anormalement grandes
      if (contentLength > 1024 * 1024) { // 1MB
        suspiciousFlags.push('LARGE_PAYLOAD');
      }

      // Détecter les contenus suspects
      if (contentType.includes('application/json') && req.body) {
        const bodyStr = JSON.stringify(req.body);
        if (bodyStr.includes('<script>') || bodyStr.includes('javascript:')) {
          suspiciousFlags.push('XSS_ATTEMPT');
        }
        if (bodyStr.toLowerCase().includes('select') || bodyStr.toLowerCase().includes('insert')) {
          suspiciousFlags.push('SQL_INJECTION_ATTEMPT');
        }
      }

      // Logger les activités suspectes
      if (suspiciousFlags.length > 0) {
        console.warn(`🚨 Activité suspecte détectée: ${suspiciousFlags.join(', ')}`, {
          ip: req.ip,
          userAgent,
          url: req.url,
          method: req.method,
          flags: suspiciousFlags
        });
      }

      // Validation normale
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

        const validatedData = schema.parse(dataToValidate);

        // Ajouter les flags de sécurité à la requête
        req.securityFlags = suspiciousFlags;

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
        }

        next();

      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({
            success: false,
            error: 'Données de validation invalides',
            details: this.formatZodErrors(error),
            message: 'Veuillez corriger les erreurs de validation'
          });
        }

        console.error('❌ Erreur de validation avec détection:', error);
        return res.status(500).json({
          success: false,
          error: 'Erreur interne de validation',
          message: 'Une erreur est survenue lors de la validation des données'
        });
      }
    };
  }

  /**
   * Middleware de validation avec chiffrement des données sensibles
   */
  static validateWithEncryption(schema, target = 'body', sensitiveFields = ['password', 'token', 'secret']) {
    const crypto = require('crypto');

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

        // Chiffrer les données sensibles
        const encryptedData = { ...dataToValidate };
        sensitiveFields.forEach(field => {
          if (encryptedData[field]) {
            const algorithm = 'aes-256-cbc';
            const key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'default-key', 'salt', 32);
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipher(algorithm, key);
            let encrypted = cipher.update(encryptedData[field], 'utf8', 'hex');
            encrypted += cipher.final('hex');
            encryptedData[field] = encrypted;
          }
        });

        // Validation avec le schéma Zod
        const validatedData = schema.parse(encryptedData);

        // Stocker les données validées
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
        }

        next();

      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({
            success: false,
            error: 'Données de validation invalides',
            details: this.formatZodErrors(error),
            message: 'Veuillez corriger les erreurs de validation'
          });
        }

        console.error('❌ Erreur de validation avec chiffrement:', error);
        return res.status(500).json({
          success: false,
          error: 'Erreur interne de validation',
          message: 'Une erreur est survenue lors de la validation des données'
        });
      }
    };
  }

  /**
   * Middleware de validation avec validation de signature
   */
  static validateWithSignature(schema, target = 'body', secretKey = process.env.SIGNATURE_SECRET) {
    const crypto = require('crypto');

    return (req, res, next) => {
      try {
        const signature = req.headers['x-signature'];
        const timestamp = req.headers['x-timestamp'];

        if (!signature || !timestamp) {
          return res.status(401).json({
            success: false,
            error: 'Signature manquante',
            message: 'Signature et timestamp requis pour cette requête'
          });
        }

        // Vérifier la signature
        const data = JSON.stringify(req.body);
        const expectedSignature = crypto
          .createHmac('sha256', secretKey)
          .update(data + timestamp)
          .digest('hex');

        if (signature !== expectedSignature) {
          return res.status(401).json({
            success: false,
            error: 'Signature invalide',
            message: 'La signature fournie est invalide'
          });
        }

        // Vérifier l'expiration (5 minutes)
        const now = Date.now();
        const requestTime = parseInt(timestamp);
        if (now - requestTime > 5 * 60 * 1000) {
          return res.status(401).json({
            success: false,
            error: 'Requête expirée',
            message: 'La requête a expiré'
          });
        }

        // Validation normale
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

        const validatedData = schema.parse(dataToValidate);

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
        }

        next();

      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({
            success: false,
            error: 'Données de validation invalides',
            details: this.formatZodErrors(error),
            message: 'Veuillez corriger les erreurs de validation'
          });
        }

        console.error('❌ Erreur de validation avec signature:', error);
        return res.status(500).json({
          success: false,
          error: 'Erreur interne de validation',
          message: 'Une erreur est survenue lors de la validation des données'
        });
      }
    };
  }

  /**
   * Formater les erreurs Zod
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
}

module.exports = SecurityValidationMiddleware; 