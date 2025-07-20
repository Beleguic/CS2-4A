const { Alert, AlertType, Product, Category, User } = require('../models');
const readService = require('../services/readService');
const denormalizationService = require('../services/denormalizationService');
const Joi = require('joi');

// Alert schema validation
const alertSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  alert_type_id: Joi.string().uuid().required(),
  product_id: Joi.string().uuid().optional(),
  category_id: Joi.string().uuid().optional(),
  is_active: Joi.boolean().optional()
});

const getAllAlerts = async (req, res, next) => {
  try {
    // Utiliser MongoDB pour les lectures
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      user_id: req.query.user_id,
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined
    };

    const alerts = await readService.getAllAlerts(filters);
    
    // Formater la réponse
    const formattedAlerts = alerts.map(alert => ({
      id: alert._id,
      user_id: alert.user_id,
      alert_type_id: alert.alert_type_id,
      product_id: alert.product_id,
      category_id: alert.category_id,
      is_active: alert.is_active,
      created_at: alert.created_at,
      updated_at: alert.updated_at,
      alertType: alert.alertType,
      product: alert.product,
      category: alert.category,
      user: alert.user
    }));

    res.json(formattedAlerts);
  } catch (e) {
    console.error('Error fetching alerts:', e);
    next(e);
  }
};

const getAlertById = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Utiliser MongoDB pour la lecture
    const alert = await readService.getAlertById(id);

    if (alert) {
      // Formater la réponse
      const formattedAlert = {
        id: alert._id,
        user_id: alert.user_id,
        alert_type_id: alert.alert_type_id,
        product_id: alert.product_id,
        category_id: alert.category_id,
        is_active: alert.is_active,
        created_at: alert.created_at,
        updated_at: alert.updated_at,
        alertType: alert.alertType,
        product: alert.product,
        category: alert.category,
        user: alert.user
      };
      
      res.json(formattedAlert);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching alert by ID:', e);
    next(e);
  }
};

const createAlert = async (req, res, next) => {
  try {
    const { error } = alertSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Utiliser PostgreSQL pour l'écriture
    const alert = await Alert.create(req.body);
    
    // Synchroniser vers MongoDB
    await denormalizationService.syncUser(alert.user_id);
    
    res.status(201).json(alert);
  } catch (e) {
    console.error('Error creating alert:', e);
    next(e);
  }
};

const updateAlert = async (req, res, next) => {
  try {
    const { error } = alertSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const alert = await Alert.findByPk(req.params.id);

    if (alert) {
      await alert.update(req.body);
      
      // Synchroniser vers MongoDB
      await denormalizationService.syncUser(alert.user_id);
      
      res.json(alert);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating alert:', e);
    next(e);
  }
};

const deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    
    if (!alert) {
      return res.sendStatus(404);
    }

    const nbDeleted = await Alert.destroy({
      where: {
        id: req.params.id,
      },
    });
    
    if (nbDeleted === 1) {
      // Supprimer de MongoDB aussi
      const mongoDb = require('../mongo');
      await mongoDb.Alert.findByIdAndDelete(req.params.id);
      
      // Synchroniser l'utilisateur
      await denormalizationService.syncUser(alert.user_id);
      
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error deleting alert:', e);
    next(e);
  }
};

module.exports = {
  getAllAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
};
