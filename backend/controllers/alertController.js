const { Alert, Product, Category, User, AlertType } = require('../models');
const Joi = require('joi');

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
    
    const alerts = await Alert.findAll({
      where,
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'username'] },
        { model: AlertType, as: 'alertType', attributes: ['type'] },
      ],
    });

    return res.status(200).json(alerts);
  } catch (e) {
    return res.sendStatus(500);
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
      return res.status(200).json(alert);
    } else {
      return res.sendStatus(404);
    }
  } catch (e) {
    return res.sendStatus(500);
  }
};

const createAlert = async (req, res, next) => {
  try {
    const { error } = alertSchema.validate(req.body);
    if (error) {
      return res.sendStatus(400);
    }
    const alert = await Alert.create(req.body);
    return res.status(201).json(alert);
  } catch (e) {
    return res.sendStatus(500);
  }
};

const updateAlert = async (req, res, next) => {
  try {
    const { error } = alertSchema.validate(req.body);
    if (error) {
      return res.sendStatus(400);
    }

    const alert = await Alert.findByPk(req.params.id);

    if (alert) {
      await alert.update(req.body);
      return res.status(200).json(alert);
    } else {
      return res.sendStatus(404);
    }
  } catch (e) {
    return res.sendStatus(500);
  }
};

const deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('Deleting alert with ID:', id);
    const alert = await Alert.findByPk(id);

    if (alert) {
      await alert.destroy();
      return res.sendStatus(204);
    } else {
      return res.sendStatus(404);
    }
  } catch (e) {
    return res.sendStatus(500);
  }
};

module.exports = {
  getAllAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
};
