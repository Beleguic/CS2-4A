const { User, Newsletter, Alert, AlertType, Product, Category, Order, Cart } = require('../models');
const readService = require('../services/readService');
const denormalizationService = require('../services/denormalizationService');
const AnonymizationService = require('../services/anonymizationService');
const Joi = require('joi');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

// User schema validation (backend)
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  dateOfBirth: Joi.date().required(),
  password: Joi.string().optional(),
  username: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  isSubscribedToNewsletter: Joi.boolean().optional()
}).options({ stripUnknown: true });

const filterUserFields = (user) => {
  const { created_at, updated_at, verification_token, reset_password_token, reset_password_expires, login_attempts, lock_until, password_last_changed, role, is_verified, ...filteredUser } = user;
  return filteredUser;
};

const filterUserResponse = (user) => {
  const { email, firstName, lastName, username, dateOfBirth, isSubscribedToNewsletter } = user;
  return { email, firstName, lastName, username, dateOfBirth, isSubscribedToNewsletter };
};

const isAdmin = (user) => user.role === 'admin';

const updateUser = async (req, res, next) => {
  try {
    const filteredBody = filterUserFields(req.body);
    const { error } = userSchema.validate(filteredBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await User.findByPk(req.params.id);
    const requestingUser = await User.findByPk(req.userData.userId);

    if (user) {
      if (isAdmin(requestingUser) && isAdmin(user) && user.id !== requestingUser.id) {
        return res.status(403).json({ message: "You cannot edit other admin accounts." });
      }

      // Ne met à jour le mot de passe que s'il est fourni
      if (!filteredBody.password) {
        delete filteredBody.password;
      }

      await user.update(filteredBody);

      // Handle newsletter subscription
      if (filteredBody.isSubscribedToNewsletter) {
        await Newsletter.findOrCreate({ where: { user_id: user.id } });
      } else {
        await Newsletter.destroy({ where: { user_id: user.id } });
      }

      // Synchroniser vers MongoDB
      await denormalizationService.syncUser(user.id);

      res.json(user);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating user:', e);
    next(e);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const requestingUser = await User.findByPk(req.userData.userId);
    
    // Utiliser MongoDB pour les lectures
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      role: req.query.role,
      is_verified: req.query.is_verified !== undefined ? req.query.is_verified === 'true' : undefined,
      search: req.query.search
    };

    // Filtrer les utilisateurs selon les permissions
    if (isAdmin(requestingUser)) {
      filters.exclude_other_admins = true;
      filters.current_user_id = requestingUser.id;
    }

    const users = await readService.getAllUsers(filters);
    
    // Formater la réponse pour correspondre à l'API existante
    const formattedUsers = users.map(user => ({
      id: user._id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      role: user.role,
      is_verified: user.is_verified,
      isSubscribedToNewsletter: user.isSubscribedToNewsletter,
      created_at: user.created_at,
      updated_at: user.updated_at,
      alerts_count: user.alerts_count,
      orders_count: user.orders_count,
      total_spent: user.total_spent,
      alerts: user.alerts,
      recent_orders: user.recent_orders
    }));

    res.json(formattedUsers);
  } catch (e) {
    console.error('Error fetching users:', e);
    next(e);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const requestingUser = await User.findByPk(req.userData.userId);
    
    // Utiliser MongoDB pour la lecture
    const user = await readService.getUserById(id);

    if (user) {
      if (isAdmin(requestingUser) && isAdmin(user) && user._id !== requestingUser.id) {
        return res.status(403).json({ message: "You cannot view other admin accounts." });
      }

      // Formater la réponse pour correspondre à l'API existante
      const userResponse = {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        isSubscribedToNewsletter: user.isSubscribedToNewsletter,
        alerts: user.alerts,
        alerts_count: user.alerts_count,
        orders_count: user.orders_count,
        total_spent: user.total_spent,
        recent_orders: user.recent_orders
      };

      res.json(userResponse);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching user by ID:', e);
    next(e);
  }
};

const createUser = async (req, res, next) => {
  try {
    const filteredBody = filterUserFields(req.body);
    const { error } = userSchema.validate(filteredBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Utiliser PostgreSQL pour l'écriture
    const user = await User.create(filteredBody);
    
    // Synchroniser vers MongoDB
    await denormalizationService.syncUser(user.id);
    
    res.status(201).json(user);
  } catch (e) {
    console.error('Error creating user:', e);
    next(e);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    const requestingUser = await User.findByPk(req.userData.userId);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Vérifier les permissions
    if (isAdmin(requestingUser) && isAdmin(user) && user.id !== requestingUser.id) {
      return res.status(403).json({ error: "Vous ne pouvez pas supprimer d'autres comptes administrateur." });
    }

    // Vérifier si l'utilisateur est déjà anonymisé
    if (user.is_anonymized) {
      return res.status(400).json({ error: 'Cet utilisateur est déjà anonymisé' });
    }

    // Anonymiser l'utilisateur au lieu de le supprimer (conformité RGPD)
    const anonymizationResult = await AnonymizationService.anonymizeUser(
      req.params.id, 
      req.body.reason || 'RGPD_REQUEST'
    );

    console.log(`✅ Utilisateur ${req.params.id} anonymisé avec succès`);

    res.json({
      success: true,
      message: 'Utilisateur anonymisé avec succès (conformité RGPD)',
      anonymizedAt: anonymizationResult.anonymizedAt,
      reason: anonymizationResult.reason
    });

  } catch (error) {
    console.error('Erreur lors de l\'anonymisation de l\'utilisateur:', error);
    res.status(500).json({ 
      error: 'Une erreur est survenue lors de l\'anonymisation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Export des données personnelles (Droit à la portabilité RGPD)
const exportUserData = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const requestingUser = await User.findByPk(req.userData.userId);

    // Vérifier les permissions
    if (!requestingUser) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Un utilisateur ne peut exporter que ses propres données
    if (requestingUser.id !== userId && requestingUser.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Récupérer l'utilisateur
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Récupérer toutes les données associées
    const userData = await collectUserData(userId);

    // Créer le dossier d'export s'il n'existe pas
    const exportDir = path.join(__dirname, '../exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Générer le nom de fichier unique
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `user_data_${userId}_${timestamp}`;

    // Créer les fichiers d'export
    const jsonPath = path.join(exportDir, `${filename}.json`);
    const csvPath = path.join(exportDir, `${filename}.csv`);

    // Sauvegarder en JSON
    fs.writeFileSync(jsonPath, JSON.stringify(userData, null, 2));

    // Sauvegarder en CSV
    const csvContent = generateCSV(userData);
    fs.writeFileSync(csvPath, csvContent);

    // Log de l'action pour audit
    console.log(`Export de données utilisateur effectué`, {
      userId,
      requestingUserId: requestingUser.id,
      requestingUserRole: requestingUser.role,
      timestamp: new Date().toISOString(),
      filesGenerated: [jsonPath, csvPath]
    });

    // Retourner les liens de téléchargement
    res.json({
      success: true,
      message: 'Export de données personnelles généré avec succès',
      files: {
        json: `/api/user/${userId}/export/download/json`,
        csv: `/api/user/${userId}/export/download/csv`
      },
      generatedAt: new Date().toISOString(),
      dataSummary: {
        user: {
          id: userData.user.id,
          email: userData.user.email,
          username: userData.user.username
        },
        ordersCount: userData.orders.length,
        alertsCount: userData.alerts.length,
        cartItemsCount: userData.cartItems.length
      }
    });

  } catch (e) {
    console.error('Erreur lors de l\'export des données utilisateur:', e);
    next(e);
  }
};

// Téléchargement des fichiers d'export
const downloadExport = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const format = req.params.format; // 'json' ou 'csv'
    const requestingUser = await User.findByPk(req.userData.userId);

    // Vérifier les permissions
    if (!requestingUser) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    if (requestingUser.id !== userId && requestingUser.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    // Valider le format
    if (!['json', 'csv'].includes(format)) {
      return res.status(400).json({ error: 'Format non supporté' });
    }

    // Trouver le fichier le plus récent pour cet utilisateur
    const exportDir = path.join(__dirname, '../exports');
    const files = fs.readdirSync(exportDir)
      .filter(file => file.startsWith(`user_data_${userId}_`) && file.endsWith(`.${format}`))
      .sort()
      .reverse();

    if (files.length === 0) {
      return res.status(404).json({ error: 'Aucun fichier d\'export trouvé' });
    }

    const filePath = path.join(exportDir, files[0]);
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    // Définir les headers pour le téléchargement
    const mimeType = format === 'json' ? 'application/json' : 'text/csv';
    const filename = `tropicool_user_data_${userId}.${format}`;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Envoyer le fichier
    res.sendFile(filePath);

  } catch (e) {
    console.error('Erreur lors du téléchargement de l\'export:', e);
    next(e);
  }
};

// Fonction pour collecter toutes les données utilisateur
const collectUserData = async (userId) => {
  try {
    // Données utilisateur de base
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verification_token', 'reset_password_token'] }
    });

    // Commandes
    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: 'products',
          through: { attributes: ['quantity', 'price'] }
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Alertes
    const alerts = await Alert.findAll({
      where: { user_id: userId },
      include: [
        {
          model: AlertType,
          as: 'alertType'
        },
        {
          model: Product,
          as: 'product'
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Panier actuel
    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: 'product'
        }
      ]
    });

    // Newsletter
    const newsletter = await Newsletter.findOne({
      where: { user_id: userId }
    });

    // Structurer les données
    return {
      exportInfo: {
        generatedAt: new Date().toISOString(),
        userId: userId,
        version: '1.0',
        description: 'Export des données personnelles - Droit à la portabilité RGPD'
      },
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        is_verified: user.is_verified,
        isSubscribedToNewsletter: user.isSubscribedToNewsletter,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      orders: orders.map(order => ({
        id: order.id,
        status: order.status,
        total_amount: order.total_amount,
        shipping_address: order.shipping_address,
        billing_address: order.billing_address,
        created_at: order.created_at,
        updated_at: order.updated_at,
        products: order.products.map(product => ({
          id: product.id,
          name: product.name,
          price: product.OrderProduct.price,
          quantity: product.OrderProduct.quantity
        }))
      })),
      alerts: alerts.map(alert => ({
        id: alert.id,
        type: alert.alertType?.name,
        product: alert.product?.name,
        created_at: alert.created_at,
        is_active: alert.is_active
      })),
      cartItems: cartItems.map(item => ({
        id: item.id,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price
        },
        quantity: item.quantity,
        added_at: item.created_at
      })),
      newsletter: newsletter ? {
        subscribed_at: newsletter.created_at,
        is_active: newsletter.is_active
      } : null,
      summary: {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0),
        totalAlerts: alerts.length,
        activeAlerts: alerts.filter(alert => alert.is_active).length,
        cartItemsCount: cartItems.length
      }
    };
  } catch (error) {
    console.error('Erreur lors de la collecte des données utilisateur:', error);
    throw error;
  }
};

// Fonction pour générer le CSV
const generateCSV = (userData) => {
  const lines = [];
  
  // En-tête
  lines.push('Section,Champ,Valeur');
  
  // Données utilisateur
  Object.entries(userData.user).forEach(([key, value]) => {
    lines.push(`User,${key},"${value}"`);
  });
  
  // Commandes
  userData.orders.forEach((order, index) => {
    lines.push(`Order ${index + 1},id,${order.id}`);
    lines.push(`Order ${index + 1},status,${order.status}`);
    lines.push(`Order ${index + 1},total_amount,${order.total_amount}`);
    lines.push(`Order ${index + 1},created_at,${order.created_at}`);
    
    order.products.forEach((product, pIndex) => {
      lines.push(`Order ${index + 1} Product ${pIndex + 1},name,${product.name}`);
      lines.push(`Order ${index + 1} Product ${pIndex + 1},price,${product.price}`);
      lines.push(`Order ${index + 1} Product ${pIndex + 1},quantity,${product.quantity}`);
    });
  });
  
  // Alertes
  userData.alerts.forEach((alert, index) => {
    lines.push(`Alert ${index + 1},type,${alert.type}`);
    lines.push(`Alert ${index + 1},product,${alert.product}`);
    lines.push(`Alert ${index + 1},created_at,${alert.created_at}`);
    lines.push(`Alert ${index + 1},is_active,${alert.is_active}`);
  });
  
  // Panier
  userData.cartItems.forEach((item, index) => {
    lines.push(`Cart Item ${index + 1},product_name,${item.product.name}`);
    lines.push(`Cart Item ${index + 1},price,${item.product.price}`);
    lines.push(`Cart Item ${index + 1},quantity,${item.quantity}`);
    lines.push(`Cart Item ${index + 1},added_at,${item.added_at}`);
  });
  
  return lines.join('\n');
};

// Anonymiser un utilisateur (conformité RGPD)
const anonymizeUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const requestingUser = await User.findByPk(req.userData.userId);

    // Vérifier les permissions
    if (!requestingUser) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Un utilisateur ne peut anonymiser que son propre compte, ou un admin peut anonymiser n'importe quel compte
    if (requestingUser.id !== userId && requestingUser.role !== 'admin') {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (user.is_anonymized) {
      return res.status(400).json({ error: 'Cet utilisateur est déjà anonymisé' });
    }

    const anonymizationResult = await AnonymizationService.anonymizeUser(
      userId, 
      req.body.reason || 'RGPD_REQUEST'
    );

    res.json({
      success: true,
      message: 'Compte anonymisé avec succès (conformité RGPD)',
      anonymizedAt: anonymizationResult.anonymizedAt,
      reason: anonymizationResult.reason
    });

  } catch (error) {
    console.error('Erreur lors de l\'anonymisation:', error);
    res.status(500).json({ 
      error: 'Une erreur est survenue lors de l\'anonymisation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Vérifier si un email peut être utilisé pour recréer un compte
const checkEmailRecreation = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    const isPreviouslyUsed = await AnonymizationService.isEmailPreviouslyUsed(email);
    const canRecreate = await AnonymizationService.allowAccountRecreation(email);

    res.json({
      email,
      isPreviouslyUsed,
      canRecreate,
      message: isPreviouslyUsed 
        ? 'Cet email était utilisé par un compte supprimé. Recréation autorisée.' 
        : 'Email disponible pour inscription'
    });

  } catch (error) {
    console.error('Erreur lors de la vérification de recréation:', error);
    res.status(500).json({ 
      error: 'Une erreur est survenue lors de la vérification',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Restaurer un compte anonymisé (admin seulement)
const restoreAnonymizedUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { newEmail, newUsername } = req.body;
    const requestingUser = await User.findByPk(req.userData.userId);

    // Vérifier que l'utilisateur est admin
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé. Rôle administrateur requis.' });
    }

    if (!newEmail || !newUsername) {
      return res.status(400).json({ error: 'Nouvel email et nom d\'utilisateur requis' });
    }

    const restorationResult = await AnonymizationService.restoreAnonymizedUser(
      userId, 
      newEmail, 
      newUsername
    );

    res.json({
      success: true,
      message: 'Compte restauré avec succès',
      restoredAt: restorationResult.restoredAt,
      newEmail: restorationResult.newEmail,
      newUsername: restorationResult.newUsername
    });

  } catch (error) {
    console.error('Erreur lors de la restauration:', error);
    res.status(500).json({ 
      error: 'Une erreur est survenue lors de la restauration',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtenir les statistiques d'anonymisation (admin seulement)
const getAnonymizationStats = async (req, res, next) => {
  try {
    const requestingUser = await User.findByPk(req.userData.userId);

    // Vérifier que l'utilisateur est admin
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ error: 'Accès refusé. Rôle administrateur requis.' });
    }

    const stats = await AnonymizationService.getAnonymizationStats();
    
    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ 
      error: 'Une erreur est survenue lors de la récupération des statistiques',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  exportUserData,
  downloadExport,
  anonymizeUser,
  checkEmailRecreation,
  restoreAnonymizedUser,
  getAnonymizationStats
};
