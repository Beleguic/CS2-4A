const mongoDb = require('../mongo');

class ReadService {
  // Méthodes existantes pour les produits
  async getAllProducts(filters = {}) {
    try {
      const query = {};
      
      if (filters.search) {
        query.$text = { $search: filters.search };
      }
      
      if (filters.category_id) {
        query['categories.id'] = filters.category_id;
      }
      
      if (filters.is_active !== undefined) {
        query.is_active = filters.is_active;
      }
      
      if (filters.min_price !== undefined || filters.max_price !== undefined) {
        query.price = {};
        if (filters.min_price !== undefined) query.price.$gte = parseFloat(filters.min_price);
        if (filters.max_price !== undefined) query.price.$lte = parseFloat(filters.max_price);
      }
      
      if (filters.is_adult !== undefined) {
        query.is_adult = filters.is_adult;
      }
      
      if (filters.brand) {
        query.brand = filters.brand;
      }
      
      if (filters.has_promotion !== undefined) {
        query.has_active_promotion = filters.has_promotion;
      }

      const options = {
        limit: filters.limit || 50,
        skip: filters.offset || 0
      };

      if (filters.sort) {
        options.sort = filters.sort;
      } else {
        options.sort = { created_at: -1 };
      }

      return await mongoDb.Product.find(query, null, options);
    } catch (error) {
      console.error('Erreur lors de la lecture des produits:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      return await mongoDb.Product.findById(id);
    } catch (error) {
      console.error('Erreur lors de la lecture du produit:', error);
      throw error;
    }
  }

  async searchProducts(searchTerm, filters = {}) {
    try {
      const query = {
        $text: { $search: searchTerm }
      };
      
      if (filters.category_id) {
        query['categories.id'] = filters.category_id;
      }
      
      if (filters.is_active !== undefined) {
        query.is_active = filters.is_active;
      }
      
      if (filters.brand) {
        query.brand = filters.brand;
      }
      
      if (filters.has_promotion !== undefined) {
        query.has_active_promotion = filters.has_promotion;
      }

      const options = {
        limit: filters.limit || 20,
        skip: filters.offset || 0,
        sort: { score: { $meta: 'textScore' } }
      };

      return await mongoDb.Product.find(query, { score: { $meta: 'textScore' } }, options);
    } catch (error) {
      console.error('Erreur lors de la recherche de produits:', error);
      throw error;
    }
  }

  // Méthodes existantes pour les catégories
  async getAllCategories(filters = {}) {
    try {
      const query = {};
      
      if (filters.is_active !== undefined) {
        query.is_active = filters.is_active;
      }
      
      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      const options = {
        limit: filters.limit || 50,
        skip: filters.offset || 0,
        sort: { name: 1 }
      };

      return await mongoDb.Category.find(query, null, options);
    } catch (error) {
      console.error('Erreur lors de la lecture des catégories:', error);
      throw error;
    }
  }

  async getCategoryById(id) {
    try {
      return await mongoDb.Category.findById(id);
    } catch (error) {
      console.error('Erreur lors de la lecture de la catégorie:', error);
      throw error;
    }
  }

  // Méthodes existantes pour les utilisateurs
  async getAllUsers(filters = {}) {
    try {
      const query = {};
      
      if (filters.role) {
        query.role = filters.role;
      }
      
      if (filters.is_verified !== undefined) {
        query.is_verified = filters.is_verified;
      }
      
      if (filters.search) {
        query.$or = [
          { username: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const options = {
        limit: filters.limit || 50,
        skip: filters.offset || 0,
        sort: { created_at: -1 }
      };

      return await mongoDb.User.find(query, null, options);
    } catch (error) {
      console.error('Erreur lors de la lecture des utilisateurs:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      return await mongoDb.User.findById(id);
    } catch (error) {
      console.error('Erreur lors de la lecture de l\'utilisateur:', error);
      throw error;
    }
  }

  // Méthodes existantes pour les commandes
  async getAllOrders(filters = {}) {
    try {
      const query = {};
      
      if (filters.user_id) {
        query.user_id = filters.user_id;
      }
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.date_from || filters.date_to) {
        query.created_at = {};
        if (filters.date_from) query.created_at.$gte = new Date(filters.date_from);
        if (filters.date_to) query.created_at.$lte = new Date(filters.date_to);
      }

      const options = {
        limit: filters.limit || 50,
        skip: filters.offset || 0,
        sort: { created_at: -1 }
      };

      return await mongoDb.Order.find(query, null, options);
    } catch (error) {
      console.error('Erreur lors de la lecture des commandes:', error);
      throw error;
    }
  }

  async getOrderById(id) {
    try {
      return await mongoDb.Order.findById(id);
    } catch (error) {
      console.error('Erreur lors de la lecture de la commande:', error);
      throw error;
    }
  }

  // Méthodes existantes pour les paniers
  async getAllCarts(filters = {}) {
    try {
      const query = {};
      
      if (filters.user_id) {
        query.user_id = filters.user_id;
      }
      
      if (filters.expired === false) {
        query.expired_at = { $gt: new Date() };
      }

      const options = {
        limit: filters.limit || 50,
        skip: filters.offset || 0,
        sort: { created_at: -1 }
      };

      return await mongoDb.Cart.find(query, null, options);
    } catch (error) {
      console.error('Erreur lors de la lecture des paniers:', error);
      throw error;
    }
  }

  async getCartById(id) {
    try {
      return await mongoDb.Cart.findById(id);
    } catch (error) {
      console.error('Erreur lors de la lecture du panier:', error);
      throw error;
    }
  }

  async getCartByUser(userId) {
    try {
      return await mongoDb.Cart.findOne({ user_id: userId });
    } catch (error) {
      console.error('Erreur lors de la lecture du panier utilisateur:', error);
      throw error;
    }
  }

  // Nouvelles méthodes pour les alertes
  async getAllAlerts(filters = {}) {
    try {
      const query = {};
      
      if (filters.user_id) {
        query.user_id = filters.user_id;
      }
      
      if (filters.is_active !== undefined) {
        query.is_active = filters.is_active;
      }
      
      if (filters.alert_type_id) {
        query.alert_type_id = filters.alert_type_id;
      }

      const options = {
        limit: filters.limit || 50,
        skip: filters.offset || 0,
        sort: { created_at: -1 }
      };

      return await mongoDb.Alert.find(query, null, options);
    } catch (error) {
      console.error('Erreur lors de la lecture des alertes:', error);
      throw error;
    }
  }

  async getAlertById(id) {
    try {
      return await mongoDb.Alert.findById(id);
    } catch (error) {
      console.error('Erreur lors de la lecture de l\'alerte:', error);
      throw error;
    }
  }

  // Nouvelles méthodes pour les types d'alertes
  async getAllAlertTypes(filters = {}) {
    try {
      const query = {};

      const options = {
        limit: filters.limit || 50,
        skip: filters.offset || 0,
        sort: { type: 1 }
      };

      return await mongoDb.AlertType.find(query, null, options);
    } catch (error) {
      console.error('Erreur lors de la lecture des types d\'alertes:', error);
      throw error;
    }
  }

  async getAlertTypeById(id) {
    try {
      return await mongoDb.AlertType.findById(id);
    } catch (error) {
      console.error('Erreur lors de la lecture du type d\'alerte:', error);
      throw error;
    }
  }

  // Nouvelles méthodes pour les newsletters
  async getAllNewsletters(filters = {}) {
    try {
      const query = {};
      
      if (filters.user_id) {
        query.user_id = filters.user_id;
      }
      
      if (filters.is_active !== undefined) {
        query.is_active = filters.is_active;
      }
      
      if (filters.email) {
        query.email = { $regex: filters.email, $options: 'i' };
      }

      const options = {
        limit: filters.limit || 50,
        skip: filters.offset || 0,
        sort: { created_at: -1 }
      };

      return await mongoDb.Newsletter.find(query, null, options);
    } catch (error) {
      console.error('Erreur lors de la lecture des newsletters:', error);
      throw error;
    }
  }

  async getNewsletterById(id) {
    try {
      return await mongoDb.Newsletter.findById(id);
    } catch (error) {
      console.error('Erreur lors de la lecture de la newsletter:', error);
      throw error;
    }
  }

  // Nouvelles méthodes pour l'historique des mots de passe
  async getAllPasswordHistories(filters = {}) {
    try {
      const query = {};
      
      if (filters.user_id) {
        query.user_id = filters.user_id;
      }

      const options = {
        limit: filters.limit || 50,
        skip: filters.offset || 0,
        sort: { created_at: -1 }
      };

      return await mongoDb.PasswordHistory.find(query, null, options);
    } catch (error) {
      console.error('Erreur lors de la lecture des historiques de mots de passe:', error);
      throw error;
    }
  }

  async getPasswordHistoryById(id) {
    try {
      return await mongoDb.PasswordHistory.findById(id);
    } catch (error) {
      console.error('Erreur lors de la lecture de l\'historique de mot de passe:', error);
      throw error;
    }
  }

  // Nouvelles méthodes pour l'historique utilisateur
  async getAllUserHistories(filters = {}) {
    try {
      const query = {};
      
      if (filters.user_id) {
        query.user_id = filters.user_id;
      }
      
      if (filters.action) {
        query.action = filters.action;
      }
      
      if (filters.date_from || filters.date_to) {
        query.created_at = {};
        if (filters.date_from) query.created_at.$gte = new Date(filters.date_from);
        if (filters.date_to) query.created_at.$lte = new Date(filters.date_to);
      }

      const options = {
        limit: filters.limit || 50,
        skip: filters.offset || 0,
        sort: { created_at: -1 }
      };

      return await mongoDb.UserHistory.find(query, null, options);
    } catch (error) {
      console.error('Erreur lors de la lecture des historiques utilisateur:', error);
      throw error;
    }
  }

  async getUserHistoryById(id) {
    try {
      return await mongoDb.UserHistory.findById(id);
    } catch (error) {
      console.error('Erreur lors de la lecture de l\'historique utilisateur:', error);
      throw error;
    }
  }

  // Nouvelles méthodes pour les codes promotion
  async getAllPromotionCodes(filters = {}) {
    try {
      const query = {};
      
      if (filters.is_active !== undefined) {
        query.is_active = filters.is_active;
      }
      
      if (filters.expired === true) {
        query.is_expired = true;
      } else if (filters.expired === false) {
        query.is_expired = false;
      }
      
      if (filters.code) {
        query.code = { $regex: filters.code, $options: 'i' };
      }

      const options = {
        limit: filters.limit || 50,
        skip: filters.offset || 0,
        sort: { created_at: -1 }
      };

      return await mongoDb.PromotionCode.find(query, null, options);
    } catch (error) {
      console.error('Erreur lors de la lecture des codes promotion:', error);
      throw error;
    }
  }

  async getPromotionCodeById(id) {
    try {
      return await mongoDb.PromotionCode.findById(id);
    } catch (error) {
      console.error('Erreur lors de la lecture du code promotion:', error);
      throw error;
    }
  }

  // Nouvelles méthodes pour les promotions produits
  async getAllProductPromotions(filters = {}) {
    try {
      const query = {};
      
      if (filters.product_id) {
        query.product_id = filters.product_id;
      }
      
      if (filters.promotion_code_id) {
        query.promotion_code_id = filters.promotion_code_id;
      }
      
      if (filters.is_active !== undefined) {
        query.is_active = filters.is_active;
      }
      
      if (filters.expired === false) {
        query.is_expired = false;
      }

      const options = {
        limit: filters.limit || 50,
        skip: filters.offset || 0,
        sort: { created_at: -1 }
      };

      return await mongoDb.ProductPromotion.find(query, null, options);
    } catch (error) {
      console.error('Erreur lors de la lecture des promotions produits:', error);
      throw error;
    }
  }

  async getProductPromotionById(id) {
    try {
      return await mongoDb.ProductPromotion.findById(id);
    } catch (error) {
      console.error('Erreur lors de la lecture de la promotion produit:', error);
      throw error;
    }
  }

  // Nouvelles méthodes pour les stocks
  async getAllStocks(filters = {}) {
    try {
      const query = {};
      
      if (filters.product_id) {
        query.product_id = filters.product_id;
      }
      
      if (filters.low_stock === true) {
        query.is_low_stock = true;
      }
      
      if (filters.min_quantity !== undefined) {
        query.quantity = { $gte: parseInt(filters.min_quantity) };
      }

      const options = {
        limit: filters.limit || 50,
        skip: filters.offset || 0,
        sort: { last_updated: -1 }
      };

      return await mongoDb.Stock.find(query, null, options);
    } catch (error) {
      console.error('Erreur lors de la lecture des stocks:', error);
      throw error;
    }
  }

  async getStockById(id) {
    try {
      return await mongoDb.Stock.findById(id);
    } catch (error) {
      console.error('Erreur lors de la lecture du stock:', error);
      throw error;
    }
  }

  async getStockByProductId(productId) {
    try {
      return await mongoDb.Stock.findOne({ product_id: productId });
    } catch (error) {
      console.error('Erreur lors de la lecture du stock par produit:', error);
      throw error;
    }
  }

  async getStockHistoryByProduct(productId) {
    try {
      // Agrégation pour obtenir l'historique des stocks par jour
      const pipeline = [
        { $match: { product_id: productId } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$created_at" }
            },
            quantity: { $first: "$quantity" },
            product_name: { $first: "$product.name" }
          }
        },
        { $sort: { _id: 1 } }
      ];

      return await mongoDb.Stock.aggregate(pipeline);
    } catch (error) {
      console.error('Erreur lors de la lecture de l\'historique des stocks:', error);
      throw error;
    }
  }

  // Nouvelles méthodes pour les relations catégorie-produit
  async getAllCategoryProducts(filters = {}) {
    try {
      const query = {};
      
      if (filters.category_id) {
        query.category_id = filters.category_id;
      }
      
      if (filters.product_id) {
        query.product_id = filters.product_id;
      }

      const options = {
        limit: filters.limit || 50,
        skip: filters.offset || 0,
        sort: { created_at: -1 }
      };

      return await mongoDb.CategoryProduct.find(query, null, options);
    } catch (error) {
      console.error('Erreur lors de la lecture des relations catégorie-produit:', error);
      throw error;
    }
  }

  async getCategoryProductById(id) {
    try {
      return await mongoDb.CategoryProduct.findById(id);
    } catch (error) {
      console.error('Erreur lors de la lecture de la relation catégorie-produit:', error);
      throw error;
    }
  }

  // Méthodes d'agrégation pour les statistiques
  async getProductStats() {
    try {
      const pipeline = [
        {
          $group: {
            _id: null,
            total_products: { $sum: 1 },
            active_products: { $sum: { $cond: ['$is_active', 1, 0] } },
            average_price: { $avg: '$price' },
            low_stock_products: { $sum: { $cond: ['$stock.is_low_stock', 1, 0] } }
          }
        }
      ];

      const result = await mongoDb.Product.aggregate(pipeline);
      return result[0] || {};
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques produits:', error);
      throw error;
    }
  }

  async getOrderStats() {
    try {
      const pipeline = [
        {
          $group: {
            _id: null,
            total_orders: { $sum: 1 },
            total_revenue: { $sum: '$total_amount' },
            average_order_value: { $avg: '$total_amount' },
            paid_orders: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } }
          }
        }
      ];

      const result = await mongoDb.Order.aggregate(pipeline);
      return result[0] || {};
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques commandes:', error);
      throw error;
    }
  }

  async getUserStats() {
    try {
      const pipeline = [
        {
          $group: {
            _id: null,
            total_users: { $sum: 1 },
            verified_users: { $sum: { $cond: ['$is_verified', 1, 0] } },
            average_orders_per_user: { $avg: '$orders_count' },
            total_revenue: { $sum: '$total_spent' }
          }
        }
      ];

      const result = await mongoDb.User.aggregate(pipeline);
      return result[0] || {};
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques utilisateurs:', error);
      throw error;
    }
  }
}

module.exports = new ReadService(); 