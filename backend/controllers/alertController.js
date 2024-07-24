const { Alert: AlertPostgres, Product, Category, User, AlertType } = require('../models');
const AlertMongo = require('../mongo/models/Alert');
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

    const alerts = await AlertMongo.find(where)
      .populate('alert_type_id')
      .populate('product_id')
      .populate('category_id')
      .populate('user_id');

    res.status(200).json(alerts);
  } catch (e) {
    console.error('Error fetching alerts:', e);
    next(e);
  }
};

const getAlertById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const alert = await AlertMongo.findById(id)
      .populate('alert_type_id')
      .populate('product_id')
      .populate('category_id')
      .populate('user_id');

    if (alert) {
      res.status(200).json(alert);
    } else {
      res.status(404).json({ message: 'Alert not found' });
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
    const alert = await AlertPostgres.create(req.body);
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

    const alert = await AlertPostgres.findByPk(req.params.id);

    if (alert) {
      await alert.update(req.body);
      await AlertMongo.updateOne({ _id: req.params.id }, req.body);
      res.status(200).json(alert);
    } else {
      res.status(404).json({ message: 'Alert not found' });
    }
  } catch (e) {
    console.error('Error updating alert:', e);
    next(e);
  }
};

const deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await AlertPostgres.findByPk(id);

    if (alert) {
      await alert.destroy();
      await AlertMongo.deleteOne({ _id: id });
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Alert not found' });
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
