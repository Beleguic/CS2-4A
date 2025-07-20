/**
 * Types TypeScript partagés pour Tropicool
 * Basés sur les schémas Zod pour une validation uniforme
 */

// ========================================
// TYPES D'AUTHENTIFICATION
// ========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface NewPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: UserData;
  message?: string;
  error?: string;
}

// ========================================
// TYPES DE PRODUITS
// ========================================

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  image_url?: string;
  is_active: boolean;
  is_promotion: boolean;
  promotion_price?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  category_id?: number;
  image_url?: string;
  is_active?: boolean;
  is_promotion?: boolean;
  promotion_price?: number | null;
}

export interface ProductQuery {
  page: number;
  limit: number;
  search?: string;
  category?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy: 'name' | 'price' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

export interface ProductResponse {
  success: boolean;
  product?: Product;
  products?: Product[];
  pagination?: PaginationInfo;
  message?: string;
  error?: string;
}

// ========================================
// TYPES DE CATÉGORIES
// ========================================

export interface Category {
  id?: number;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface CategoryResponse {
  success: boolean;
  category?: Category;
  categories?: Category[];
  message?: string;
  error?: string;
}

// ========================================
// TYPES DE COMMANDES
// ========================================

export interface OrderItem {
  product_id: number;
  quantity: number;
}

export interface ShippingAddress {
  street: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id?: number;
  user_id?: number;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  payment_method: 'card' | 'paypal' | 'stripe';
  notes?: string;
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface OrderUpdate {
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
  notes?: string;
}

export interface OrderResponse {
  success: boolean;
  order?: Order;
  orders?: Order[];
  pagination?: PaginationInfo;
  message?: string;
  error?: string;
}

// ========================================
// TYPES DE PANIER
// ========================================

export interface CartItem {
  product_id: number;
  quantity: number;
}

export interface CartUpdate {
  quantity: number;
}

export interface CartResponse {
  success: boolean;
  cart?: CartItem[];
  total?: number;
  message?: string;
  error?: string;
}

// ========================================
// TYPES D'UTILISATEURS
// ========================================

export interface User {
  id?: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: ShippingAddress;
  role: 'user' | 'admin' | 'store_keeper' | 'compta';
  is_active: boolean;
  email_verified?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: ShippingAddress;
  role?: 'user' | 'admin' | 'store_keeper' | 'compta';
  is_active?: boolean;
}

export interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin' | 'store_keeper' | 'compta';
  is_active: boolean;
}

export interface UserResponse {
  success: boolean;
  user?: User;
  users?: User[];
  pagination?: PaginationInfo;
  message?: string;
  error?: string;
}

// ========================================
// TYPES DE PRÉFÉRENCES DE CONFIDENTIALITÉ
// ========================================

export interface PrivacyPreferences {
  id?: number;
  user_id?: number;
  privacy_level: 'strict' | 'moderate' | 'permissive';
  
  // Cookies et tracking
  accept_essential_cookies: boolean;
  accept_analytics_cookies: boolean;
  accept_marketing_cookies: boolean;
  accept_third_party_cookies: boolean;
  
  // Communications et marketing
  receive_email_marketing: boolean;
  receive_sms_marketing: boolean;
  receive_push_notifications: boolean;
  receive_newsletter: boolean;
  
  // Partage de données
  share_data_analytics: boolean;
  share_data_research: boolean;
  share_data_partners: boolean;
  
  // Profil et visibilité
  profile_visibility: 'public' | 'friends' | 'private';
  show_email_public: boolean;
  show_phone_public: boolean;
  show_address_public: boolean;
  
  // Historique et données
  save_search_history: boolean;
  save_browsing_history: boolean;
  save_purchase_history: boolean;
  
  // Géolocalisation
  allow_location_tracking: boolean;
  allow_location_services: boolean;
  
  // Personnalisation
  allow_personalization: boolean;
  allow_recommendations: boolean;
  allow_targeted_ads: boolean;
  
  // Rétention des données
  data_retention_period: '30_days' | '90_days' | '1_year' | '3_years' | 'indefinite';
  auto_delete_inactive: boolean;
  
  // Notifications de sécurité
  security_notifications: boolean;
  privacy_notifications: boolean;
  
  created_at?: Date;
  updated_at?: Date;
}

export interface PrivacyResponse {
  success: boolean;
  preferences?: PrivacyPreferences;
  message?: string;
  error?: string;
}

// ========================================
// TYPES DE PROMOTIONS
// ========================================

export interface PromotionCode {
  id?: number;
  code: string;
  discount_percentage: number;
  max_uses?: number;
  expires_at?: Date;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface PromotionCodeUpdate {
  code?: string;
  discount_percentage?: number;
  max_uses?: number;
  expires_at?: Date;
  is_active?: boolean;
}

export interface PromotionResponse {
  success: boolean;
  promotion?: PromotionCode;
  promotions?: PromotionCode[];
  pagination?: PaginationInfo;
  message?: string;
  error?: string;
}

// ========================================
// TYPES DE STOCK
// ========================================

export interface Stock {
  id?: number;
  product_id: number;
  quantity: number;
  alert_threshold: number;
  location?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface StockUpdate {
  quantity?: number;
  alert_threshold?: number;
  location?: string;
}

export interface StockResponse {
  success: boolean;
  stock?: Stock;
  stocks?: Stock[];
  pagination?: PaginationInfo;
  message?: string;
  error?: string;
}

// ========================================
// TYPES D'ALERTES
// ========================================

export interface Alert {
  id?: number;
  user_id: number;
  alert_type_id: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface AlertUpdate {
  user_id?: number;
  alert_type_id?: number;
  is_active?: boolean;
}

export interface AlertResponse {
  success: boolean;
  alert?: Alert;
  alerts?: Alert[];
  pagination?: PaginationInfo;
  message?: string;
  error?: string;
}

// ========================================
// TYPES DE NEWSLETTER
// ========================================

export interface Newsletter {
  id?: number;
  email: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface NewsletterResponse {
  success: boolean;
  newsletter?: Newsletter;
  message?: string;
  error?: string;
}

// ========================================
// TYPES D'AUDIT
// ========================================

export interface AuditLog {
  id?: number;
  user_id?: number;
  action_type: string;
  action_category: 'AUTHENTICATION' | 'DATA_PROTECTION' | 'ORDER_MANAGEMENT' | 'PRODUCT_MANAGEMENT' | 'USER_MANAGEMENT' | 'SECURITY' | 'SYSTEM' | 'RGPD';
  action_severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  action_description: string;
  action_details?: any;
  resource_type?: string;
  resource_id?: string;
  resource_before?: any;
  resource_after?: any;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  request_method?: string;
  request_url?: string;
  request_headers?: any;
  request_body?: any;
  response_status?: number;
  execution_time?: number;
  memory_usage?: number;
  context_data?: any;
  security_flags?: any;
  retention_period: '30_DAYS' | '90_DAYS' | '1_YEAR' | '3_YEARS' | 'INDEFINITE';
  is_archived: boolean;
  archive_date?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface AuditFilter {
  userId?: number;
  actionType?: string;
  actionCategory?: 'AUTHENTICATION' | 'DATA_PROTECTION' | 'ORDER_MANAGEMENT' | 'PRODUCT_MANAGEMENT' | 'USER_MANAGEMENT' | 'SECURITY' | 'SYSTEM' | 'RGPD';
  actionSeverity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditResponse {
  success: boolean;
  logs?: AuditLog[];
  pagination?: PaginationInfo;
  stats?: AuditStats;
  message?: string;
  error?: string;
}

export interface AuditStats {
  totalLogs: number;
  criticalLogs: number;
  highSeverityLogs: number;
  breakdown: Record<string, Record<string, number>>;
}

// ========================================
// TYPES UTILITAIRES
// ========================================

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'xml';
  includeMetadata: boolean;
  includeSchema: boolean;
  compression: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: any;
  pagination?: PaginationInfo;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  received?: any;
}

export interface ValidationResponse {
  success: false;
  error: 'Données de validation invalides';
  details: Record<string, ValidationError>;
  message: string;
}

// ========================================
// TYPES DE SÉCURITÉ
// ========================================

export interface SecurityConfig {
  passwordMinLength: number;
  passwordMaxLength: number;
  passwordRegex: RegExp;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordExpiryDays: number;
}

export interface SecurityFlags {
  suspicious?: boolean;
  blocked?: boolean;
  rate_limited?: boolean;
  flags?: string[];
}

// ========================================
// TYPES DE CONFIGURATION
// ========================================

export interface AppConfig {
  environment: 'development' | 'production' | 'test';
  port: number;
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  email: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  };
  stripe: {
    secretKey: string;
    publishableKey: string;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
}

// ========================================
// TYPES D'ENUM
// ========================================

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  STORE_KEEPER = 'store_keeper',
  COMPTA = 'compta'
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CARD = 'card',
  PAYPAL = 'paypal',
  STRIPE = 'stripe'
}

export enum PrivacyLevel {
  STRICT = 'strict',
  MODERATE = 'moderate',
  PERMISSIVE = 'permissive'
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  FRIENDS = 'friends',
  PRIVATE = 'private'
}

export enum DataRetentionPeriod {
  THIRTY_DAYS = '30_days',
  NINETY_DAYS = '90_days',
  ONE_YEAR = '1_year',
  THREE_YEARS = '3_years',
  INDEFINITE = 'indefinite'
}

export enum ActionCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  DATA_PROTECTION = 'DATA_PROTECTION',
  ORDER_MANAGEMENT = 'ORDER_MANAGEMENT',
  PRODUCT_MANAGEMENT = 'PRODUCT_MANAGEMENT',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  SECURITY = 'SECURITY',
  SYSTEM = 'SYSTEM',
  RGPD = 'RGPD'
}

export enum ActionSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  XML = 'xml'
}

// ========================================
// TYPES DE REQUÊTES ET RÉPONSES GÉNÉRIQUES
// ========================================

export interface BaseRequest {
  [key: string]: any;
}

export interface BaseResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ListResponse<T> extends BaseResponse {
  data: T[];
  pagination: PaginationInfo;
}

export interface SingleResponse<T> extends BaseResponse {
  data: T;
}

export interface DeleteResponse extends BaseResponse {
  deletedCount: number;
}

export interface CountResponse extends BaseResponse {
  count: number;
}

// ========================================
// TYPES DE MIDDLEWARE
// ========================================

export interface RequestWithUser {
  userData?: {
    userId: number;
    email: string;
    role: UserRole;
  };
  validatedBody?: any;
  validatedQuery?: any;
  validatedParams?: any;
  validatedData?: any;
  [key: string]: any;
}

export interface RequestWithValidation {
  validatedBody?: any;
  validatedQuery?: any;
  validatedParams?: any;
  validatedData?: any;
  [key: string]: any;
}

// ========================================
// TYPES DE VALIDATION
// ========================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'url' | 'date' | 'enum';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: string[];
  custom?: (value: any) => boolean;
  message?: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

 