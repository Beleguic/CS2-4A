const { describe, it, expect, beforeEach } = require('@jest/globals');
const { z } = require('zod');
const ValidationUtils = require('../utils/validationUtils');
const ValidationMiddleware = require('../middlewares/validationMiddleware');
const SecurityValidationMiddleware = require('../middlewares/securityValidationMiddleware');

// Import des schémas
const {
  loginSchema,
  registerSchema,
  productSchema,
  categorySchema,
  orderSchema,
  userSchema,
  privacyPreferencesSchema,
  promotionCodeSchema,
  stockSchema,
  auditFilterSchema
} = require('../validations/schemas');

describe('Validation Tests - Tropicool', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
      ip: '127.0.0.1',
      get: jest.fn(),
      headers: {}
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();
  });

  describe('Schémas d\'authentification', () => {
    describe('loginSchema', () => {
      it('devrait valider un login valide', () => {
        const validData = {
          email: 'test@example.com',
          password: 'SecurePass123!'
        };

        const result = loginSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('devrait rejeter un email invalide', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'SecurePass123!'
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('Format d\'email invalide');
      });

      it('devrait rejeter un mot de passe trop court', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'short'
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('12 caractères');
      });

      it('devrait rejeter un mot de passe sans caractères spéciaux', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'SecurePass123'
        };

        const result = loginSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('caractère spécial');
      });
    });

    describe('registerSchema', () => {
      it('devrait valider un enregistrement valide', () => {
        const validData = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!'
        };

        const result = registerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('devrait rejeter des mots de passe qui ne correspondent pas', () => {
        const invalidData = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'DifferentPass123!'
        };

        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('ne correspondent pas');
      });

      it('devrait rejeter un nom d\'utilisateur avec caractères spéciaux', () => {
        const invalidData = {
          username: 'test@user',
          email: 'test@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!'
        };

        const result = registerSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('lettres, chiffres, tirets et underscores');
      });
    });
  });

  describe('Schémas de produits', () => {
    describe('productSchema', () => {
      it('devrait valider un produit valide', () => {
        const validData = {
          name: 'Produit Test',
          description: 'Description détaillée du produit test',
          price: 29.99,
          stock: 100,
          category_id: 1,
          image_url: 'https://example.com/image.jpg',
          is_active: true,
          is_promotion: false
        };

        const result = productSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('devrait rejeter un prix négatif', () => {
        const invalidData = {
          name: 'Produit Test',
          description: 'Description détaillée',
          price: -10,
          stock: 100,
          category_id: 1
        };

        const result = productSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('positif');
      });

      it('devrait rejeter un stock négatif', () => {
        const invalidData = {
          name: 'Produit Test',
          description: 'Description détaillée',
          price: 29.99,
          stock: -5,
          category_id: 1
        };

        const result = productSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('négatif');
      });

      it('devrait rejeter une description trop courte', () => {
        const invalidData = {
          name: 'Produit Test',
          description: 'Court',
          price: 29.99,
          stock: 100,
          category_id: 1
        };

        const result = productSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('10 caractères');
      });
    });
  });

  describe('Schémas de catégories', () => {
    describe('categorySchema', () => {
      it('devrait valider une catégorie valide', () => {
        const validData = {
          name: 'Catégorie Test',
          description: 'Description détaillée de la catégorie',
          image_url: 'https://example.com/category.jpg',
          is_active: true
        };

        const result = categorySchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('devrait rejeter un nom vide', () => {
        const invalidData = {
          name: '',
          description: 'Description détaillée',
          is_active: true
        };

        const result = categorySchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('requis');
      });
    });
  });

  describe('Schémas de commandes', () => {
    describe('orderSchema', () => {
      it('devrait valider une commande valide', () => {
        const validData = {
          items: [
            { product_id: 1, quantity: 2 },
            { product_id: 2, quantity: 1 }
          ],
          shipping_address: {
            street: '123 Rue Test',
            city: 'Paris',
            postal_code: '75001',
            country: 'France'
          },
          payment_method: 'card',
          notes: 'Livraison en matinée'
        };

        const result = orderSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('devrait rejeter une commande sans items', () => {
        const invalidData = {
          items: [],
          shipping_address: {
            street: '123 Rue Test',
            city: 'Paris',
            postal_code: '75001',
            country: 'France'
          },
          payment_method: 'card'
        };

        const result = orderSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('Au moins un produit');
      });

      it('devrait rejeter un code postal invalide', () => {
        const invalidData = {
          items: [{ product_id: 1, quantity: 1 }],
          shipping_address: {
            street: '123 Rue Test',
            city: 'Paris',
            postal_code: '123',
            country: 'France'
          },
          payment_method: 'card'
        };

        const result = orderSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('5 chiffres');
      });
    });
  });

  describe('Schémas d\'utilisateurs', () => {
    describe('userSchema', () => {
      it('devrait valider un utilisateur valide', () => {
        const validData = {
          username: 'testuser',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          phone: '+33123456789',
          address: {
            street: '123 Rue Test',
            city: 'Paris',
            postal_code: '75001',
            country: 'France'
          },
          role: 'user',
          is_active: true
        };

        const result = userSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('devrait rejeter un numéro de téléphone invalide', () => {
        const invalidData = {
          username: 'testuser',
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          phone: 'invalid-phone',
          role: 'user',
          is_active: true
        };

        const result = userSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        expect(result.error.issues[0].message).toContain('Format de téléphone invalide');
      });
    });
  });

  describe('Schémas de préférences de confidentialité', () => {
    describe('privacyPreferencesSchema', () => {
      it('devrait valider des préférences valides', () => {
        const validData = {
          privacy_level: 'strict',
          accept_essential_cookies: true,
          accept_analytics_cookies: false,
          accept_marketing_cookies: false,
          accept_third_party_cookies: false,
          receive_email_marketing: false,
          receive_sms_marketing: false,
          receive_push_notifications: false,
          receive_newsletter: false,
          share_data_analytics: false,
          share_data_research: false,
          share_data_partners: false,
          profile_visibility: 'private',
          show_email_public: false,
          show_phone_public: false,
          show_address_public: false,
          save_search_history: true,
          save_browsing_history: true,
          save_purchase_history: true,
          allow_location_tracking: false,
          allow_location_services: false,
          allow_personalization: false,
          allow_recommendations: false,
          allow_targeted_ads: false,
          data_retention_period: '1_year',
          auto_delete_inactive: true,
          security_notifications: true,
          privacy_notifications: true
        };

        const result = privacyPreferencesSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('devrait utiliser les valeurs par défaut', () => {
        const minimalData = {};

        const result = privacyPreferencesSchema.safeParse(minimalData);
        expect(result.success).toBe(true);
        expect(result.data.privacy_level).toBe('moderate');
        expect(result.data.accept_essential_cookies).toBe(true);
        expect(result.data.accept_analytics_cookies).toBe(false);
      });
    });
  });

  describe('ValidationUtils', () => {
    describe('sanitizeString', () => {
      it('devrait nettoyer une chaîne avec caractères dangereux', () => {
        const dirtyString = '<script>alert("xss")</script>Hello World';
        const cleanString = ValidationUtils.sanitizeString(dirtyString);
        expect(cleanString).toBe('alert("xss")Hello World');
      });

      it('devrait limiter la longueur', () => {
        const longString = 'A'.repeat(300);
        const limitedString = ValidationUtils.sanitizeString(longString, 100);
        expect(limitedString.length).toBe(100);
      });
    });

    describe('sanitizeEmail', () => {
      it('devrait valider et normaliser un email', () => {
        const email = '  TEST@EXAMPLE.COM  ';
        const normalizedEmail = ValidationUtils.sanitizeEmail(email);
        expect(normalizedEmail).toBe('test@example.com');
      });

      it('devrait rejeter un email invalide', () => {
        expect(() => {
          ValidationUtils.sanitizeEmail('invalid-email');
        }).toThrow('Format d\'email invalide');
      });
    });

    describe('validatePassword', () => {
      it('devrait valider un mot de passe conforme', () => {
        const password = 'SecurePass123!';
        expect(() => {
          ValidationUtils.validatePassword(password);
        }).not.toThrow();
      });

      it('devrait rejeter un mot de passe trop court', () => {
        expect(() => {
          ValidationUtils.validatePassword('short');
        }).toThrow('12 caractères');
      });

      it('devrait rejeter un mot de passe sans caractères spéciaux', () => {
        expect(() => {
          ValidationUtils.validatePassword('SecurePass123');
        }).toThrow('caractère spécial');
      });
    });

    describe('sanitizePhone', () => {
      it('devrait normaliser un numéro français', () => {
        const phone = '0123456789';
        const normalizedPhone = ValidationUtils.sanitizePhone(phone);
        expect(normalizedPhone).toBe('+33123456789');
      });

      it('devrait accepter un numéro déjà au format international', () => {
        const phone = '+33123456789';
        const normalizedPhone = ValidationUtils.sanitizePhone(phone);
        expect(normalizedPhone).toBe('+33123456789');
      });
    });

    describe('sanitizePostalCode', () => {
      it('devrait valider un code postal français', () => {
        const postalCode = '75001';
        const validatedCode = ValidationUtils.sanitizePostalCode(postalCode);
        expect(validatedCode).toBe('75001');
      });

      it('devrait rejeter un code postal invalide', () => {
        expect(() => {
          ValidationUtils.sanitizePostalCode('123');
        }).toThrow('5 chiffres');
      });
    });

    describe('sanitizePrice', () => {
      it('devrait valider et arrondir un prix', () => {
        const price = 29.999;
        const validatedPrice = ValidationUtils.sanitizePrice(price);
        expect(validatedPrice).toBe(30);
      });

      it('devrait rejeter un prix négatif', () => {
        expect(() => {
          ValidationUtils.sanitizePrice(-10);
        }).toThrow('positif');
      });
    });

    describe('sanitizeComplete', () => {
      it('devrait appliquer toutes les sanitisations', () => {
        const data = {
          name: '<script>alert("xss")</script>Test',
          email: 'test@example.com',
          password: 'secret123',
          query: 'SELECT * FROM users'
        };

        const sanitized = ValidationUtils.sanitizeComplete(data);
        expect(sanitized.name).toBe('alert("xss")Test');
        expect(sanitized.password).toBe('[SENSIBLE]');
        expect(sanitized.query).toBe('[SENSIBLE]');
      });
    });
  });

  describe('ValidationMiddleware', () => {
    describe('validate', () => {
      it('devrait valider des données valides', () => {
        const schema = z.object({
          name: z.string(),
          email: z.string().email()
        });

        mockReq.body = {
          name: 'Test User',
          email: 'test@example.com'
        };

        const middleware = ValidationMiddleware.validate(schema, 'body');
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.validatedBody).toEqual({
          name: 'Test User',
          email: 'test@example.com'
        });
      });

      it('devrait rejeter des données invalides', () => {
        const schema = z.object({
          name: z.string(),
          email: z.string().email()
        });

        mockReq.body = {
          name: 'Test User',
          email: 'invalid-email'
        };

        const middleware = ValidationMiddleware.validate(schema, 'body');
        middleware(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: 'Données de validation invalides'
          })
        );
      });
    });

    describe('validateLogin', () => {
      it('devrait valider un login valide', () => {
        mockReq.body = {
          email: 'test@example.com',
          password: 'SecurePass123!'
        };

        const middleware = ValidationMiddleware.validateLogin();
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.validatedBody).toEqual({
          email: 'test@example.com',
          password: 'SecurePass123!'
        });
      });
    });

    describe('validateProduct', () => {
      it('devrait valider un produit valide', () => {
        mockReq.body = {
          name: 'Produit Test',
          description: 'Description détaillée du produit',
          price: 29.99,
          stock: 100,
          category_id: 1,
          is_active: true,
          is_promotion: false
        };

        const middleware = ValidationMiddleware.validateProduct();
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.validatedBody).toBeDefined();
      });
    });
  });

  describe('SecurityValidationMiddleware', () => {
    describe('validateAndSanitizeXSS', () => {
      it('devrait nettoyer les tentatives XSS', () => {
        const schema = z.object({
          name: z.string(),
          description: z.string()
        });

        mockReq.body = {
          name: '<script>alert("xss")</script>Test',
          description: 'Description normale'
        };

        const middleware = SecurityValidationMiddleware.validateAndSanitizeXSS(schema, 'body');
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.validatedBody.name).toBe('alert("xss")Test');
      });
    });

    describe('validateWithRateLimit', () => {
      it('devrait accepter les requêtes dans la limite', () => {
        const schema = z.object({ test: z.string() });
        mockReq.body = { test: 'value' };

        const middleware = SecurityValidationMiddleware.validateWithRateLimit(schema, 'body', 10, 60000);
        
        // Première requête
        middleware(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalled();
      });

      it('devrait rejeter les requêtes au-delà de la limite', () => {
        const schema = z.object({ test: z.string() });
        mockReq.body = { test: 'value' };

        const middleware = SecurityValidationMiddleware.validateWithRateLimit(schema, 'body', 1, 60000);
        
        // Première requête
        middleware(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalled();

        // Deuxième requête (devrait être rejetée)
        mockNext.mockClear();
        middleware(mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(429);
      });
    });

    describe('validateWithSuspiciousActivityDetection', () => {
      it('devrait détecter les tentatives XSS', () => {
        const schema = z.object({ content: z.string() });
        mockReq.body = { content: '<script>alert("xss")</script>' };
        mockReq.get.mockReturnValue('application/json');

        const middleware = SecurityValidationMiddleware.validateWithSuspiciousActivityDetection(schema, 'body');
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.securityFlags).toContain('XSS_ATTEMPT');
      });

      it('devrait détecter les tentatives SQL injection', () => {
        const schema = z.object({ query: z.string() });
        mockReq.body = { query: 'SELECT * FROM users' };
        mockReq.get.mockReturnValue('application/json');

        const middleware = SecurityValidationMiddleware.validateWithSuspiciousActivityDetection(schema, 'body');
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockReq.securityFlags).toContain('SQL_INJECTION_ATTEMPT');
      });
    });
  });

  describe('Tests d\'intégration', () => {
    it('devrait valider un flux complet d\'enregistrement', () => {
      // 1. Validation du formulaire d'enregistrement
      const registerData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      };

      const registerResult = registerSchema.safeParse(registerData);
      expect(registerResult.success).toBe(true);

      // 2. Validation des données utilisateur
      const userData = {
        username: 'newuser',
        email: 'newuser@example.com',
        first_name: 'John',
        last_name: 'Doe',
        role: 'user',
        is_active: true
      };

      const userResult = userSchema.safeParse(userData);
      expect(userResult.success).toBe(true);

      // 3. Validation des préférences de confidentialité
      const privacyData = {
        privacy_level: 'moderate',
        accept_essential_cookies: true,
        accept_analytics_cookies: false,
        profile_visibility: 'private'
      };

      const privacyResult = privacyPreferencesSchema.safeParse(privacyData);
      expect(privacyResult.success).toBe(true);
    });

    it('devrait valider un flux complet de commande', () => {
      // 1. Validation du produit
      const productData = {
        name: 'Produit Test',
        description: 'Description détaillée du produit',
        price: 29.99,
        stock: 100,
        category_id: 1,
        is_active: true,
        is_promotion: false
      };

      const productResult = productSchema.safeParse(productData);
      expect(productResult.success).toBe(true);

      // 2. Validation de la commande
      const orderData = {
        items: [
          { product_id: 1, quantity: 2 }
        ],
        shipping_address: {
          street: '123 Rue Test',
          city: 'Paris',
          postal_code: '75001',
          country: 'France'
        },
        payment_method: 'card'
      };

      const orderResult = orderSchema.safeParse(orderData);
      expect(orderResult.success).toBe(true);
    });
  });
}); 