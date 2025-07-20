const { 
  Product, Category, User, Order, Cart, 
  Alert, AlertType, Newsletter, PasswordHistory, 
  UserHistory, ProductPromotion, PromotionCode, 
  Stock, CategoryProduct 
} = require('../models');
const mongoDb = require('../mongo');

class DenormalizationService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log('🔄 Initialisation du service de dénormalisation...');
      
      // Créer les index MongoDB
      await this.createIndexes();
      
      // Synchroniser toutes les données
      await this.syncAllData();
      
      this.isInitialized = true;
      console.log('✅ Service de dénormalisation initialisé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du service de dénormalisation:', error);
      throw error;
    }
  }

  async createIndexes() {
    try {
      console.log('📊 Création des index MongoDB...');
      
      // Index pour les produits
      await mongoDb.Product.collection.createIndex({ name: 'text', description: 'text' });
      await mongoDb.Product.collection.createIndex({ category_id: 1 });
      await mongoDb.Product.collection.createIndex({ is_active: 1 });
      await mongoDb.Product.collection.createIndex({ price: 1 });
      
      // Index pour les catégories
      await mongoDb.Category.collection.createIndex({ name: 'text' });
      await mongoDb.Category.collection.createIndex({ is_active: 1 });
      
      // Index pour les utilisateurs
      await mongoDb.User.collection.createIndex({ email: 1 });
      await mongoDb.User.collection.createIndex({ username: 1 });
      await mongoDb.User.collection.createIndex({ role: 1 });
      
      // Index pour les commandes
      await mongoDb.Order.collection.createIndex({ user_id: 1 });
      await mongoDb.Order.collection.createIndex({ status: 1 });
      await mongoDb.Order.collection.createIndex({ created_at: -1 });
      
      // Index pour les paniers
      await mongoDb.Cart.collection.createIndex({ user_id: 1 });
      await mongoDb.Cart.collection.createIndex({ expired_at: 1 });
      
      // Index pour les alertes
      await mongoDb.Alert.collection.createIndex({ user_id: 1 });
      await mongoDb.Alert.collection.createIndex({ is_active: 1 });
      
      // Index pour les types d'alertes
      await mongoDb.AlertType.collection.createIndex({ type: 1 });
      
      // Index pour les newsletters
      await mongoDb.Newsletter.collection.createIndex({ user_id: 1 });
      await mongoDb.Newsletter.collection.createIndex({ email: 1 });
      await mongoDb.Newsletter.collection.createIndex({ is_active: 1 });
      
      // Index pour l'historique des mots de passe
      await mongoDb.PasswordHistory.collection.createIndex({ user_id: 1 });
      await mongoDb.PasswordHistory.collection.createIndex({ created_at: -1 });
      
      // Index pour l'historique utilisateur
      await mongoDb.UserHistory.collection.createIndex({ user_id: 1 });
      await mongoDb.UserHistory.collection.createIndex({ action: 1 });
      await mongoDb.UserHistory.collection.createIndex({ created_at: -1 });
      
      // Index pour les promotions produits
      await mongoDb.ProductPromotion.collection.createIndex({ product_id: 1 });
      await mongoDb.ProductPromotion.collection.createIndex({ is_active: 1 });
      await mongoDb.ProductPromotion.collection.createIndex({ end_date: 1 });
      
      // Index pour les codes promotion
      await mongoDb.PromotionCode.collection.createIndex({ code: 1 });
      await mongoDb.PromotionCode.collection.createIndex({ is_active: 1 });
      await mongoDb.PromotionCode.collection.createIndex({ end_date: 1 });
      
      // Index pour les stocks
      await mongoDb.Stock.collection.createIndex({ product_id: 1 });
      await mongoDb.Stock.collection.createIndex({ quantity: 1 });
      await mongoDb.Stock.collection.createIndex({ last_updated: -1 });
      
      // Index pour les relations catégorie-produit
      await mongoDb.CategoryProduct.collection.createIndex({ category_id: 1 });
      await mongoDb.CategoryProduct.collection.createIndex({ product_id: 1 });
      
      console.log('✅ Index MongoDB créés avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la création des index:', error);
      throw error;
    }
  }

  async syncAllData() {
    try {
      console.log('🔄 Synchronisation complète des données...');
      
      await Promise.all([
        this.syncCategories(),
        this.syncProducts(),
        this.syncUsers(),
        this.syncOrders(),
        this.syncCarts(),
        this.syncAlertTypes(),
        this.syncAlerts(),
        this.syncNewsletters(),
        this.syncPasswordHistories(),
        this.syncUserHistories(),
        this.syncPromotionCodes(),
        this.syncProductPromotions(),
        this.syncStocks(),
        this.syncCategoryProducts()
      ]);
      
      console.log('✅ Synchronisation complète terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation complète:', error);
      throw error;
    }
  }

  // Méthodes existantes...
  async syncCategories() {
    try {
      const categories = await Category.findAll({
        include: [
          {
            model: Product,
            as: 'products',
            through: { attributes: [] }
          }
        ]
      });

      for (const category of categories) {
        const denormalizedCategory = {
          _id: category.id,
          name: category.name,
          description: category.description,
          url: category.url,
          image: category.image,
          is_active: category.is_active,
          created_at: category.created_at,
          updated_at: category.updated_at,
          products_count: category.products ? category.products.length : 0,
          products: category.products ? category.products.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
          })) : []
        };

        await mongoDb.Category.findByIdAndUpdate(
          category.id,
          denormalizedCategory,
          { upsert: true, new: true }
        );
      }
      
      console.log(`✅ ${categories.length} catégories synchronisées`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des catégories:', error);
      throw error;
    }
  }

  async syncProducts() {
    try {
      const products = await Product.findAll({
        include: [
          {
            model: Category,
            as: 'categories',
            through: { attributes: [] }
          },
          {
            model: Stock,
            as: 'stock'
          }
        ]
      });

      for (const product of products) {
        const denormalizedProduct = {
          _id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          reference: product.reference,
          is_adult: product.is_adult,
          tva: product.tva,
          is_active: product.is_active,
          created_at: product.created_at,
          updated_at: product.updated_at,
          categories: product.categories ? product.categories.map(category => ({
            id: category.id,
            name: category.name
          })) : [],
          stock: product.stock ? {
            quantity: product.stock.quantity,
            alert_threshold: product.stock.alert_threshold,
            is_low_stock: product.stock.quantity <= product.stock.alert_threshold
          } : null
        };

        await mongoDb.Product.findByIdAndUpdate(
          product.id,
          denormalizedProduct,
          { upsert: true, new: true }
        );
      }
      
      console.log(`✅ ${products.length} produits synchronisés`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des produits:', error);
      throw error;
    }
  }

  async syncUsers() {
    try {
      const users = await User.findAll({
        include: [
          {
            model: Order,
            as: 'orders'
          },
          {
            model: Cart,
            as: 'cart'
          }
        ]
      });

      for (const user of users) {
        const denormalizedUser = {
          _id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified,
          created_at: user.created_at,
          updated_at: user.updated_at,
          orders_count: user.orders ? user.orders.length : 0,
          total_spent: user.orders ? user.orders.reduce((sum, order) => sum + (order.total || 0), 0) : 0,
          last_order_date: user.orders && user.orders.length > 0 ? 
            Math.max(...user.orders.map(order => new Date(order.created_at))) : null
        };

        await mongoDb.User.findByIdAndUpdate(
          user.id,
          denormalizedUser,
          { upsert: true, new: true }
        );
      }
      
      console.log(`✅ ${users.length} utilisateurs synchronisés`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des utilisateurs:', error);
      throw error;
    }
  }

  async syncOrders() {
    try {
      const orders = await Order.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          }
        ]
      });

      for (const order of orders) {
        const denormalizedOrder = {
          _id: order.id,
          user_id: order.user_id,
          total_amount: order.total,
          status: order.isPayed ? 'paid' : 'pending',
          shipping_address: order.livraison,
          billing_address: order.adresseFacturation,
          payment_method: 'stripe', // À adapter selon votre logique
          created_at: order.created_at,
          updated_at: order.updated_at,
          user: order.user ? {
            id: order.user.id,
            username: order.user.username,
            email: order.user.email
          } : null
        };

        await mongoDb.Order.findByIdAndUpdate(
          order.id,
          denormalizedOrder,
          { upsert: true, new: true }
        );
      }
      
      console.log(`✅ ${orders.length} commandes synchronisées`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des commandes:', error);
      throw error;
    }
  }

  async syncCarts() {
    try {
      const carts = await Cart.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          }
        ]
      });

      for (const cart of carts) {
        const denormalizedCart = {
          _id: cart.id,
          user_id: cart.user_id,
          items: cart.cartProductsData || [],
          total_amount: cart.cartProductsData ? 
            cart.cartProductsData.reduce((sum, item) => sum + (item.price * item.quantity), 0) : 0,
          created_at: cart.created_at,
          updated_at: cart.updated_at,
          expired_at: cart.expired_at,
          user: cart.user ? {
            id: cart.user.id,
            username: cart.user.username
          } : null
        };

        await mongoDb.Cart.findByIdAndUpdate(
          cart.id,
          denormalizedCart,
          { upsert: true, new: true }
        );
      }
      
      console.log(`✅ ${carts.length} paniers synchronisés`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des paniers:', error);
      throw error;
    }
  }

  // Nouvelles méthodes de synchronisation
  async syncAlertTypes() {
    try {
      const alertTypes = await AlertType.findAll();

      for (const alertType of alertTypes) {
        const denormalizedAlertType = {
          _id: alertType.id,
          type: alertType.type,
          name: alertType.name,
          description: alertType.description,
          created_at: alertType.created_at,
          updated_at: alertType.updated_at
        };

        await mongoDb.AlertType.findByIdAndUpdate(
          alertType.id,
          denormalizedAlertType,
          { upsert: true, new: true }
        );
      }
      
      console.log(`✅ ${alertTypes.length} types d'alertes synchronisés`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des types d\'alertes:', error);
      throw error;
    }
  }

  async syncAlerts() {
    try {
      const alerts = await Alert.findAll({
        include: [
          {
            model: AlertType,
            as: 'alertType',
            attributes: ['id', 'type', 'name']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name']
          },
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          }
        ]
      });

      for (const alert of alerts) {
        const denormalizedAlert = {
          _id: alert.id,
          user_id: alert.user_id,
          alert_type_id: alert.alert_type_id,
          product_id: alert.product_id,
          category_id: alert.category_id,
          is_active: alert.is_active,
          created_at: alert.created_at,
          updated_at: alert.updated_at,
          alertType: alert.alertType ? {
            id: alert.alertType.id,
            type: alert.alertType.type,
            name: alert.alertType.name
          } : null,
          product: alert.product ? {
            id: alert.product.id,
            name: alert.product.name
          } : null,
          category: alert.category ? {
            id: alert.category.id,
            name: alert.category.name
          } : null,
          user: alert.user ? {
            id: alert.user.id,
            username: alert.user.username
          } : null
        };

        await mongoDb.Alert.findByIdAndUpdate(
          alert.id,
          denormalizedAlert,
          { upsert: true, new: true }
        );
      }
      
      console.log(`✅ ${alerts.length} alertes synchronisées`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des alertes:', error);
      throw error;
    }
  }

  async syncNewsletters() {
    try {
      const newsletters = await Newsletter.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          }
        ]
      });

      for (const newsletter of newsletters) {
        const denormalizedNewsletter = {
          _id: newsletter.id,
          user_id: newsletter.user_id,
          email: newsletter.email,
          is_active: newsletter.is_active,
          preferences: newsletter.preferences,
          created_at: newsletter.created_at,
          updated_at: newsletter.updated_at,
          user: newsletter.user ? {
            id: newsletter.user.id,
            username: newsletter.user.username,
            email: newsletter.user.email
          } : null
        };

        await mongoDb.Newsletter.findByIdAndUpdate(
          newsletter.id,
          denormalizedNewsletter,
          { upsert: true, new: true }
        );
      }
      
      console.log(`✅ ${newsletters.length} newsletters synchronisées`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des newsletters:', error);
      throw error;
    }
  }

  async syncPasswordHistories() {
    try {
      const passwordHistories = await PasswordHistory.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          }
        ]
      });

      for (const passwordHistory of passwordHistories) {
        const denormalizedPasswordHistory = {
          _id: passwordHistory.id,
          user_id: passwordHistory.user_id,
          password_hash: passwordHistory.password_hash,
          created_at: passwordHistory.created_at,
          updated_at: passwordHistory.updated_at,
          user: passwordHistory.user ? {
            id: passwordHistory.user.id,
            username: passwordHistory.user.username
          } : null
        };

        await mongoDb.PasswordHistory.findByIdAndUpdate(
          passwordHistory.id,
          denormalizedPasswordHistory,
          { upsert: true, new: true }
        );
      }
      
      console.log(`✅ ${passwordHistories.length} historiques de mots de passe synchronisés`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des historiques de mots de passe:', error);
      throw error;
    }
  }

  async syncUserHistories() {
    try {
      const userHistories = await UserHistory.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username']
          }
        ]
      });

      for (const userHistory of userHistories) {
        const denormalizedUserHistory = {
          _id: userHistory.id,
          user_id: userHistory.user_id,
          action: userHistory.action,
          details: userHistory.details,
          ip_address: userHistory.ip_address,
          user_agent: userHistory.user_agent,
          created_at: userHistory.created_at,
          updated_at: userHistory.updated_at,
          user: userHistory.user ? {
            id: userHistory.user.id,
            username: userHistory.user.username
          } : null
        };

        await mongoDb.UserHistory.findByIdAndUpdate(
          userHistory.id,
          denormalizedUserHistory,
          { upsert: true, new: true }
        );
      }
      
      console.log(`✅ ${userHistories.length} historiques utilisateur synchronisés`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des historiques utilisateur:', error);
      throw error;
    }
  }

  async syncPromotionCodes() {
    try {
      const promotionCodes = await PromotionCode.findAll();

      for (const promotionCode of promotionCodes) {
        const now = new Date();
        const isExpired = promotionCode.end_date && new Date(promotionCode.end_date) < now;
        const isAvailable = promotionCode.is_active && !isExpired && 
          (!promotionCode.max_uses || promotionCode.current_uses < promotionCode.max_uses);

        const denormalizedPromotionCode = {
          _id: promotionCode.id,
          code: promotionCode.code,
          discount_percentage: promotionCode.discount_percentage,
          start_date: promotionCode.start_date,
          end_date: promotionCode.end_date,
          is_active: promotionCode.is_active,
          max_uses: promotionCode.max_uses,
          current_uses: promotionCode.current_uses,
          created_at: promotionCode.created_at,
          updated_at: promotionCode.updated_at,
          is_expired: isExpired,
          is_available: isAvailable
        };

        await mongoDb.PromotionCode.findByIdAndUpdate(
          promotionCode.id,
          denormalizedPromotionCode,
          { upsert: true, new: true }
        );
      }
      
      console.log(`✅ ${promotionCodes.length} codes promotion synchronisés`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des codes promotion:', error);
      throw error;
    }
  }

  async syncProductPromotions() {
    try {
      const productPromotions = await ProductPromotion.findAll({
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name']
          },
          {
            model: PromotionCode,
            as: 'promotionCode',
            attributes: ['id', 'code', 'discount_percentage']
          }
        ]
      });

      for (const productPromotion of productPromotions) {
        const now = new Date();
        const isExpired = productPromotion.end_date && new Date(productPromotion.end_date) < now;
        const isAvailable = productPromotion.is_active && !isExpired;

        const denormalizedProductPromotion = {
          _id: productPromotion.id,
          product_id: productPromotion.product_id,
          promotion_code_id: productPromotion.promotion_code_id,
          discount_amount: productPromotion.discount_amount,
          start_date: productPromotion.start_date,
          end_date: productPromotion.end_date,
          is_active: productPromotion.is_active,
          created_at: productPromotion.created_at,
          updated_at: productPromotion.updated_at,
          product: productPromotion.product ? {
            id: productPromotion.product.id,
            name: productPromotion.product.name
          } : null,
          promotionCode: productPromotion.promotionCode ? {
            id: productPromotion.promotionCode.id,
            code: productPromotion.promotionCode.code,
            discount_percentage: productPromotion.promotionCode.discount_percentage
          } : null,
          is_expired: isExpired,
          is_available: isAvailable
        };

        await mongoDb.ProductPromotion.findByIdAndUpdate(
          productPromotion.id,
          denormalizedProductPromotion,
          { upsert: true, new: true }
        );
      }
      
      console.log(`✅ ${productPromotions.length} promotions produits synchronisées`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des promotions produits:', error);
      throw error;
    }
  }

  async syncStocks() {
    try {
      const stocks = await Stock.findAll({
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name']
          }
        ]
      });

      for (const stock of stocks) {
        const denormalizedStock = {
          _id: stock.id,
          product_id: stock.product_id,
          quantity: stock.quantity,
          alert_threshold: stock.alert_threshold,
          location: stock.location,
          last_updated: stock.last_updated,
          created_at: stock.created_at,
          updated_at: stock.updated_at,
          product: stock.product ? {
            id: stock.product.id,
            name: stock.product.name
          } : null,
          is_low_stock: stock.quantity <= stock.alert_threshold
        };

        await mongoDb.Stock.findByIdAndUpdate(
          stock.id,
          denormalizedStock,
          { upsert: true, new: true }
        );
      }
      
      console.log(`✅ ${stocks.length} stocks synchronisés`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des stocks:', error);
      throw error;
    }
  }

  async syncCategoryProducts() {
    try {
      const categoryProducts = await CategoryProduct.findAll({
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name']
          }
        ]
      });

      for (const categoryProduct of categoryProducts) {
        const denormalizedCategoryProduct = {
          _id: categoryProduct.id,
          category_id: categoryProduct.category_id,
          product_id: categoryProduct.product_id,
          created_at: categoryProduct.created_at,
          updated_at: categoryProduct.updated_at,
          category: categoryProduct.category ? {
            id: categoryProduct.category.id,
            name: categoryProduct.category.name
          } : null,
          product: categoryProduct.product ? {
            id: categoryProduct.product.id,
            name: categoryProduct.product.name
          } : null
        };

        await mongoDb.CategoryProduct.findByIdAndUpdate(
          categoryProduct.id,
          denormalizedCategoryProduct,
          { upsert: true, new: true }
        );
      }
      
      console.log(`✅ ${categoryProducts.length} relations catégorie-produit synchronisées`);
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation des relations catégorie-produit:', error);
      throw error;
    }
  }

  // Méthodes de synchronisation individuelles
  async syncCategory(categoryId) {
    try {
      const category = await Category.findByPk(categoryId, {
        include: [
          {
            model: Product,
            as: 'products',
            through: { attributes: [] }
          }
        ]
      });

      if (category) {
        const denormalizedCategory = {
          _id: category.id,
          name: category.name,
          description: category.description,
          url: category.url,
          image: category.image,
          is_active: category.is_active,
          created_at: category.created_at,
          updated_at: category.updated_at,
          products_count: category.products ? category.products.length : 0,
          products: category.products ? category.products.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image
          })) : []
        };

        await mongoDb.Category.findByIdAndUpdate(
          category.id,
          denormalizedCategory,
          { upsert: true, new: true }
        );
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la synchronisation de la catégorie ${categoryId}:`, error);
    }
  }

  async syncProduct(productId) {
    try {
      const product = await Product.findByPk(productId, {
        include: [
          {
            model: Category,
            as: 'categories',
            through: { attributes: [] }
          },
          {
            model: Stock,
            as: 'stock'
          }
        ]
      });

      if (product) {
        const denormalizedProduct = {
          _id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          reference: product.reference,
          is_adult: product.is_adult,
          tva: product.tva,
          is_active: product.is_active,
          created_at: product.created_at,
          updated_at: product.updated_at,
          categories: product.categories ? product.categories.map(category => ({
            id: category.id,
            name: category.name
          })) : [],
          stock: product.stock ? {
            quantity: product.stock.quantity,
            alert_threshold: product.stock.alert_threshold,
            is_low_stock: product.stock.quantity <= product.stock.alert_threshold
          } : null
        };

        await mongoDb.Product.findByIdAndUpdate(
          product.id,
          denormalizedProduct,
          { upsert: true, new: true }
        );
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la synchronisation du produit ${productId}:`, error);
    }
  }

  async syncUser(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Order,
            as: 'orders'
          },
          {
            model: Cart,
            as: 'cart'
          }
        ]
      });

      if (user) {
        const denormalizedUser = {
          _id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          is_verified: user.is_verified,
          created_at: user.created_at,
          updated_at: user.updated_at,
          orders_count: user.orders ? user.orders.length : 0,
          total_spent: user.orders ? user.orders.reduce((sum, order) => sum + (order.total || 0), 0) : 0,
          last_order_date: user.orders && user.orders.length > 0 ? 
            Math.max(...user.orders.map(order => new Date(order.created_at))) : null
        };

        await mongoDb.User.findByIdAndUpdate(
          user.id,
          denormalizedUser,
          { upsert: true, new: true }
        );
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la synchronisation de l'utilisateur ${userId}:`, error);
    }
  }
}

module.exports = new DenormalizationService(); 