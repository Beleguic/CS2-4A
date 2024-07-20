const { Alert, Product, Category, User, AlertType } = require('../models');
const Joi = require('joi');

// Alert schema validation
const alertSchema = Joi.object({
  alert_type_id: Joi.string().uuid().required(),
  product_id: Joi.string().uuid().optional().allow(null),
  category_id: Joi.string().uuid().optional().allow(null),
  user_id: Joi.string().uuid().required(),
});

const getAllAlerts = async (req, res, next) => {
  try {
    const { user_id } = req.query;
    const where = {};

    if (user_id) {
      where.user_id = user_id;
    }
    
    console.log('Fetching alerts with conditions:', where);

    const alerts = await Alert.findAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'username'] },
        { model: AlertType, as: 'alertType', attributes: ['type'] },
      ],
    });

    console.log('Fetched alerts:', alerts);

    res.json(alerts);
  } catch (e) {
    console.error('Error fetching alerts:', e);
    next(e);
  }
};

const getAlertById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const alert = await Alert.findByPk(id, {
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'username'] },
        { model: AlertType, as: 'alertType', attributes: ['type'] },
      ],
    });

    if (alert) {
      res.json(alert);
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
    const alert = await Alert.create(req.body);
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
    const { id } = req.params;
    console.log('Deleting alert with ID:', id); // Log the ID being deleted
    const alert = await Alert.findByPk(id);

    if (alert) {
      await alert.destroy();
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
