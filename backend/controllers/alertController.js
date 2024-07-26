const { Alert: AlertPostgres, Product, Category, User, AlertType, sequelize } = require('../models');
const AlertMongo = require('../mongo/models/Alert');
const Joi = require('joi');
const mongoose = require('mongoose');

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
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const { error } = alertSchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    const alertPostgres = await AlertPostgres.create(req.body, { transaction });

    const alertMongo = new AlertMongo({
      _id: alertPostgres.id,
      ...req.body
    });
    await alertMongo.save({ session });

    await transaction.commit();
    await session.commitTransaction();
    res.status(201).json(alertPostgres);
  } catch (e) {
    console.error('Error creating alert:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

const updateAlert = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const { error } = alertSchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    const alertPostgres = await AlertPostgres.findByPk(req.params.id);
    if (!alertPostgres) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(404).json({ message: 'Alert not found in PostgreSQL' });
    }

    await alertPostgres.update(req.body, { transaction });

    const alertMongo = await AlertMongo.findById(req.params.id).session(session);
    if (alertMongo) {
      Object.assign(alertMongo, req.body);
      await alertMongo.save({ session });
    }

    await transaction.commit();
    await session.commitTransaction();
    res.status(200).json(alertPostgres);
  } catch (e) {
    console.error('Error updating alert:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

const deleteAlert = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const alertPostgres = await AlertPostgres.findByPk(req.params.id);
    if (!alertPostgres) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(404).json({ message: 'Alert not found in PostgreSQL' });
    }

    await alertPostgres.destroy({ transaction });

    const alertMongo = await AlertMongo.findById(req.params.id).session(session);
    if (alertMongo) {
      await alertMongo.remove({ session });
    }

    await transaction.commit();
    await session.commitTransaction();
    res.status(204).send();
  } catch (e) {
    console.error('Error deleting alert:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

module.exports = {
  getAllAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
};
