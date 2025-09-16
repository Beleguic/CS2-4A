// Types pour les utilisateurs
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  dateOfBirth: string;
  role: 'user' | 'admin' | 'store_keeper' | 'compta';
  isVerified: boolean;
  isSubscribedToNewsletter?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Types pour les produits
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  is_active: boolean;
  is_adult: boolean;
  reference: string;
  tva: number;
  stock?: number;
  categories?: Category[];
  createdAt: string;
  updatedAt: string;
}

// Types pour les catégories
export interface Category {
  id: string;
  name: string;
  description: string;
  url: string;
  image: string;
  is_active: boolean;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

// Types pour le panier
export interface CartItem {
  product_id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  reference: string;
  tva: number;
  is_adult: boolean;
}

export interface Cart {
  id: string;
  user_id: string;
  cartProductsData: CartItem[];
  createdAt: string;
  updatedAt: string;
}

// Types pour les commandes
export interface Order {
  id: string;
  user_id: string;
  products: CartItem[];
  total: number;
  tva: number;
  isPayed: boolean;
  livraison: string;
  adresseFacturation: Address;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  createdAt: string;
}

// Types pour les adresses
export interface Address {
  nom: string;
  prenom: string;
  societe?: string;
  adresse: string;
  adresse2?: string;
  ville: string;
  code_postale: string;
  telephone: string;
}

// Types pour les formulaires
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  lastName: string;
  firstName: string;
  username: string;
  birthday: string;
  acceptTerms: boolean;
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Types pour la pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  data: T[];
}

// Types pour les alertes
export interface Alert {
  id: string;
  user_id: string;
  type: string;
  message: string;
  is_read: boolean;
  createdAt: string;
}

// Types pour les stocks
export interface Stock {
  id: string;
  product_id: string;
  quantity: number;
  difference: string;
  status: 'add' | 'remove';
  createdAt: string;
}

// Types pour les promotions
export interface Promotion {
  id: string;
  code: string;
  discount_percentage: number;
  discount_amount: number;
  min_amount: number;
  max_uses: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
  createdAt: string;
}
