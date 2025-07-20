const { z } = require('zod');

/**
 * Schémas de validation Zod harmonisés pour Tropicool
 * Remplace les validations Joi dispersées dans les contrôleurs
 */

// ========================================
// SCHÉMAS D'AUTHENTIFICATION
// ========================================

const loginSchema = z.object({
  email: z.string()
    .email('Format d\'email invalide')
    .min(1, 'L\'email est requis'),
  password: z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial')
});

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(50, 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'),
  email: z.string()
    .email('Format d\'email invalide')
    .min(1, 'L\'email est requis'),
  password: z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'),
  confirmPassword: z.string()
    .min(1, 'La confirmation du mot de passe est requise')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

const resetPasswordSchema = z.object({
  email: z.string()
    .email('Format d\'email invalide')
    .min(1, 'L\'email est requis')
});

const newPasswordSchema = z.object({
  token: z.string()
    .min(1, 'Le token est requis'),
  password: z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'),
  confirmPassword: z.string()
    .min(1, 'La confirmation du mot de passe est requise')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string()
    .min(12, 'Le nouveau mot de passe doit contenir au moins 12 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Le mot de passe doit contenir au moins une minuscule, une majuscule, un chiffre et un caractère spécial'),
  confirmNewPassword: z.string()
    .min(1, 'La confirmation du nouveau mot de passe est requise')
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Les nouveaux mots de passe ne correspondent pas',
  path: ['confirmNewPassword']
});

// ========================================
// SCHÉMAS DE PRODUITS
// ========================================

const productSchema = z.object({
  name: z.string()
    .min(1, 'Le nom du produit est requis')
    .max(255, 'Le nom du produit ne peut pas dépasser 255 caractères'),
  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères'),
  price: z.number()
    .positive('Le prix doit être positif')
    .min(0.01, 'Le prix minimum est de 0.01'),
  stock: z.number()
    .int('Le stock doit être un nombre entier')
    .min(0, 'Le stock ne peut pas être négatif'),
  category_id: z.number()
    .int('L\'ID de catégorie doit être un nombre entier')
    .positive('L\'ID de catégorie doit être positif'),
  image_url: z.string()
    .url('L\'URL de l\'image doit être valide')
    .optional(),
  is_active: z.boolean()
    .default(true),
  is_promotion: z.boolean()
    .default(false),
  promotion_price: z.number()
    .positive('Le prix de promotion doit être positif')
    .optional()
    .nullable()
});

const productUpdateSchema = productSchema.partial();

const productQuerySchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Le numéro de page doit être un nombre')
    .transform(Number)
    .default('1'),
  limit: z.string()
    .regex(/^\d+$/, 'La limite doit être un nombre')
    .transform(Number)
    .default('10'),
  search: z.string()
    .optional(),
  category: z.string()
    .regex(/^\d+$/, 'L\'ID de catégorie doit être un nombre')
    .transform(Number)
    .optional(),
  minPrice: z.string()
    .regex(/^\d+(\.\d+)?$/, 'Le prix minimum doit être un nombre')
    .transform(Number)
    .optional(),
  maxPrice: z.string()
    .regex(/^\d+(\.\d+)?$/, 'Le prix maximum doit être un nombre')
    .transform(Number)
    .optional(),
  sortBy: z.enum(['name', 'price', 'created_at'])
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc'])
    .default('desc')
});

// ========================================
// SCHÉMAS DE CATÉGORIES
// ========================================

const categorySchema = z.object({
  name: z.string()
    .min(1, 'Le nom de la catégorie est requis')
    .max(100, 'Le nom de la catégorie ne peut pas dépasser 100 caractères'),
  description: z.string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
  image_url: z.string()
    .url('L\'URL de l\'image doit être valide')
    .optional(),
  is_active: z.boolean()
    .default(true)
});

const categoryUpdateSchema = categorySchema.partial();

// ========================================
// SCHÉMAS DE COMMANDES
// ========================================

const orderItemSchema = z.object({
  product_id: z.number()
    .int('L\'ID du produit doit être un nombre entier')
    .positive('L\'ID du produit doit être positif'),
  quantity: z.number()
    .int('La quantité doit être un nombre entier')
    .min(1, 'La quantité minimum est de 1')
    .max(100, 'La quantité maximum est de 100')
});

const orderSchema = z.object({
  items: z.array(orderItemSchema)
    .min(1, 'Au moins un produit est requis'),
  shipping_address: z.object({
    street: z.string()
      .min(1, 'L\'adresse est requise')
      .max(255, 'L\'adresse ne peut pas dépasser 255 caractères'),
    city: z.string()
      .min(1, 'La ville est requise')
      .max(100, 'La ville ne peut pas dépasser 100 caractères'),
    postal_code: z.string()
      .regex(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres'),
    country: z.string()
      .min(1, 'Le pays est requis')
      .max(100, 'Le pays ne peut pas dépasser 100 caractères')
  }),
  payment_method: z.enum(['card', 'paypal', 'stripe'])
    .default('card'),
  notes: z.string()
    .max(500, 'Les notes ne peuvent pas dépasser 500 caractères')
    .optional()
});

const orderUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
    .optional(),
  tracking_number: z.string()
    .max(100, 'Le numéro de suivi ne peut pas dépasser 100 caractères')
    .optional(),
  notes: z.string()
    .max(500, 'Les notes ne peuvent pas dépasser 500 caractères')
    .optional()
});

// ========================================
// SCHÉMAS DE PANIER
// ========================================

const cartItemSchema = z.object({
  product_id: z.number()
    .int('L\'ID du produit doit être un nombre entier')
    .positive('L\'ID du produit doit être positif'),
  quantity: z.number()
    .int('La quantité doit être un nombre entier')
    .min(1, 'La quantité minimum est de 1')
    .max(100, 'La quantité maximum est de 100')
});

const cartUpdateSchema = z.object({
  quantity: z.number()
    .int('La quantité doit être un nombre entier')
    .min(1, 'La quantité minimum est de 1')
    .max(100, 'La quantité maximum est de 100')
});

// ========================================
// SCHÉMAS D'UTILISATEURS
// ========================================

const userSchema = z.object({
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(50, 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'),
  email: z.string()
    .email('Format d\'email invalide')
    .min(1, 'L\'email est requis'),
  first_name: z.string()
    .min(1, 'Le prénom est requis')
    .max(100, 'Le prénom ne peut pas dépasser 100 caractères'),
  last_name: z.string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  phone: z.string()
    .regex(/^(\+33|0)[1-9](\d{8})$/, 'Format de téléphone invalide')
    .optional(),
  address: z.object({
    street: z.string()
      .min(1, 'L\'adresse est requise')
      .max(255, 'L\'adresse ne peut pas dépasser 255 caractères'),
    city: z.string()
      .min(1, 'La ville est requise')
      .max(100, 'La ville ne peut pas dépasser 100 caractères'),
    postal_code: z.string()
      .regex(/^\d{5}$/, 'Le code postal doit contenir 5 chiffres'),
    country: z.string()
      .min(1, 'Le pays est requis')
      .max(100, 'Le pays ne peut pas dépasser 100 caractères')
  }).optional(),
  role: z.enum(['user', 'admin', 'store_keeper', 'compta'])
    .default('user'),
  is_active: z.boolean()
    .default(true)
});

const userUpdateSchema = userSchema.partial().omit({ password: true });

// ========================================
// SCHÉMAS DE PRÉFÉRENCES DE CONFIDENTIALITÉ
// ========================================

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

// ========================================
// SCHÉMAS DE PROMOTIONS
// ========================================

const promotionCodeSchema = z.object({
  code: z.string()
    .min(3, 'Le code promo doit contenir au moins 3 caractères')
    .max(50, 'Le code promo ne peut pas dépasser 50 caractères')
    .regex(/^[A-Z0-9_-]+$/, 'Le code promo ne peut contenir que des lettres majuscules, chiffres, tirets et underscores'),
  discount_percentage: z.number()
    .min(1, 'Le pourcentage de réduction doit être au moins de 1%')
    .max(100, 'Le pourcentage de réduction ne peut pas dépasser 100%'),
  max_uses: z.number()
    .int('Le nombre maximum d\'utilisations doit être un nombre entier')
    .min(1, 'Le nombre maximum d\'utilisations doit être au moins de 1')
    .optional(),
  expires_at: z.date()
    .min(new Date(), 'La date d\'expiration doit être dans le futur')
    .optional(),
  is_active: z.boolean()
    .default(true)
});

const promotionCodeUpdateSchema = promotionCodeSchema.partial();

// ========================================
// SCHÉMAS DE STOCK
// ========================================

const stockSchema = z.object({
  product_id: z.number()
    .int('L\'ID du produit doit être un nombre entier')
    .positive('L\'ID du produit doit être positif'),
  quantity: z.number()
    .int('La quantité doit être un nombre entier')
    .min(0, 'La quantité ne peut pas être négative'),
  alert_threshold: z.number()
    .int('Le seuil d\'alerte doit être un nombre entier')
    .min(0, 'Le seuil d\'alerte ne peut pas être négatif')
    .default(10),
  location: z.string()
    .max(100, 'L\'emplacement ne peut pas dépasser 100 caractères')
    .optional()
});

const stockUpdateSchema = stockSchema.partial();

// ========================================
// SCHÉMAS D'ALERTES
// ========================================

const alertSchema = z.object({
  user_id: z.number()
    .int('L\'ID de l\'utilisateur doit être un nombre entier')
    .positive('L\'ID de l\'utilisateur doit être positif'),
  alert_type_id: z.number()
    .int('L\'ID du type d\'alerte doit être un nombre entier')
    .positive('L\'ID du type d\'alerte doit être positif'),
  is_active: z.boolean()
    .default(true)
});

const alertUpdateSchema = alertSchema.partial();

// ========================================
// SCHÉMAS DE NEWSLETTER
// ========================================

const newsletterSchema = z.object({
  email: z.string()
    .email('Format d\'email invalide')
    .min(1, 'L\'email est requis'),
  is_active: z.boolean()
    .default(true)
});

// ========================================
// SCHÉMAS DE PAGINATION ET FILTRES
// ========================================

const paginationSchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Le numéro de page doit être un nombre')
    .transform(Number)
    .default('1'),
  limit: z.string()
    .regex(/^\d+$/, 'La limite doit être un nombre')
    .transform(Number)
    .default('10')
});

const dateRangeSchema = z.object({
  startDate: z.string()
    .datetime('Format de date invalide')
    .optional(),
  endDate: z.string()
    .datetime('Format de date invalide')
    .optional()
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'La date de début doit être antérieure à la date de fin',
  path: ['endDate']
});

// ========================================
// SCHÉMAS D'EXPORT
// ========================================

const exportSchema = z.object({
  format: z.enum(['json', 'csv', 'xml'])
    .default('json'),
  includeMetadata: z.boolean()
    .default(true),
  includeSchema: z.boolean()
    .default(true),
  compression: z.boolean()
    .default(true)
});

// ========================================
// SCHÉMAS D'AUDIT
// ========================================

const auditFilterSchema = z.object({
  userId: z.string()
    .regex(/^\d+$/, 'L\'ID utilisateur doit être un nombre')
    .transform(Number)
    .optional(),
  actionType: z.string()
    .optional(),
  actionCategory: z.enum(['AUTHENTICATION', 'DATA_PROTECTION', 'ORDER_MANAGEMENT', 'PRODUCT_MANAGEMENT', 'USER_MANAGEMENT', 'SECURITY', 'SYSTEM', 'RGPD'])
    .optional(),
  actionSeverity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .optional(),
  resourceType: z.string()
    .optional(),
  resourceId: z.string()
    .optional(),
  ipAddress: z.string()
    .ip('Format d\'adresse IP invalide')
    .optional(),
  ...dateRangeSchema.shape
});

// ========================================
// EXPORT DES SCHÉMAS
// ========================================

module.exports = {
  // Authentification
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  newPasswordSchema,
  changePasswordSchema,
  
  // Produits
  productSchema,
  productUpdateSchema,
  productQuerySchema,
  
  // Catégories
  categorySchema,
  categoryUpdateSchema,
  
  // Commandes
  orderSchema,
  orderUpdateSchema,
  orderItemSchema,
  
  // Panier
  cartItemSchema,
  cartUpdateSchema,
  
  // Utilisateurs
  userSchema,
  userUpdateSchema,
  
  // Confidentialité
  privacyPreferencesSchema,
  
  // Promotions
  promotionCodeSchema,
  promotionCodeUpdateSchema,
  
  // Stock
  stockSchema,
  stockUpdateSchema,
  
  // Alertes
  alertSchema,
  alertUpdateSchema,
  
  // Newsletter
  newsletterSchema,
  
  // Utilitaires
  paginationSchema,
  dateRangeSchema,
  exportSchema,
  auditFilterSchema
}; 