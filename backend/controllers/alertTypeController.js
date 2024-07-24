const { AlertType } = require('../models'); // Modèle PostgreSQL
const AlertTypeMongo = require('../mongo/models/AlertType'); // Modèle MongoDB
const Joi = require('joi');

// AlertType schema validation
const alertTypeSchema = Joi.object({
  type: Joi.string().min(3).max(255).required(),
});

const getAllAlertTypes = async (req, res, next) => {
  try {
    const alertTypes = await AlertTypeMongo.find();
    res.status(200).json(alertTypes);
  } catch (e) {
    console.error('Error fetching alert types:', e);
    next(e);
  }
};

const getAlertTypeById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const alertType = await AlertTypeMongo.findById(id);

    if (alertType) {
      res.status(200).json(alertType);
    } else {
      res.status(404).json({ message: 'Alert type not found' });
    }
  } catch (e) {
    console.error('Error fetching alert type by ID:', e);
    next(e);
  }
};

const createAlertType = async (req, res, next) => {
  try {
    const { error } = alertTypeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const alertType = await AlertType.create(req.body); // Utilise le modèle PostgreSQL
    res.status(201).json(alertType);
  } catch (e) {
    console.error('Error creating alert type:', e);
    next(e);
  }
};

const updateAlertType = async (req, res, next) => {
  try {
    const { error } = alertTypeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const alertType = await AlertType.findByPk(req.params.id); // Utilise le modèle PostgreSQL

    if (alertType) {
      await alertType.update(req.body);
      res.status(200).json(alertType);
    } else {
      res.status(404).json({ message: 'Alert type not found' });
    }
  } catch (e) {
    console.error('Error updating alert type:', e);
    next(e);
  }
};

const deleteAlertType = async (req, res, next) => {
  try {
    const nbDeleted = await AlertType.destroy({
      where: {
        id: req.params.id,
      },
    }); // Utilise le modèle PostgreSQL
    if (nbDeleted === 1) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Alert type not found' });
    }
  } catch (e) {
    console.error('Error deleting alert type:', e);
    next(e);
  }
};

module.exports = {
  getAllAlertTypes,
  getAlertTypeById,
  createAlertType,
  updateAlertType,
  deleteAlertType,
};
