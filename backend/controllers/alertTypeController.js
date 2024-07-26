const { AlertType: AlertTypePostgres, sequelize } = require('../models');
const AlertTypeMongo = require('../mongo/models/AlertType');
const Joi = require('joi');
const mongoose = require('mongoose');

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
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const { error } = alertTypeSchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    const alertTypePostgres = await AlertTypePostgres.create(req.body, { transaction });

    const alertTypeMongo = new AlertTypeMongo({
      _id: alertTypePostgres.id,
      ...req.body
    });
    await alertTypeMongo.save({ session });

    await transaction.commit();
    await session.commitTransaction();
    res.status(201).json(alertTypePostgres);
  } catch (e) {
    console.error('Error creating alert type:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

const updateAlertType = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const { error } = alertTypeSchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    const alertTypePostgres = await AlertTypePostgres.findByPk(req.params.id);
    if (!alertTypePostgres) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(404).json({ message: 'Alert type not found in PostgreSQL' });
    }

    await alertTypePostgres.update(req.body, { transaction });

    const alertTypeMongo = await AlertTypeMongo.findById(req.params.id).session(session);
    if (alertTypeMongo) {
      Object.assign(alertTypeMongo, req.body);
      await alertTypeMongo.save({ session });
    }

    await transaction.commit();
    await session.commitTransaction();
    res.json(alertTypePostgres);
  } catch (e) {
    console.error('Error updating alert type:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

const deleteAlertType = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const alertTypePostgres = await AlertTypePostgres.findByPk(req.params.id);
    if (!alertTypePostgres) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(404).json({ message: 'Alert type not found in PostgreSQL' });
    }

    await alertTypePostgres.destroy({ transaction });

    const alertTypeMongo = await AlertTypeMongo.findById(req.params.id).session(session);
    if (alertTypeMongo) {
      await alertTypeMongo.remove({ session });
    }

    await transaction.commit();
    await session.commitTransaction();
    res.status(204).send();
  } catch (e) {
    console.error('Error deleting alert type:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

module.exports = {
  getAllAlertTypes,
  getAlertTypeById,
  createAlertType,
  updateAlertType,
  deleteAlertType,
};
