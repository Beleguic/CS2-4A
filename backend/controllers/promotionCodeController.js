const { PromotionCode: PromotionCodePostgres, sequelize } = require('../models');
const PromotionCodeMongo = require('../mongo/models/PromotionCode');
const Joi = require('joi');
const mongoose = require('mongoose');

const promotionCodeSchema = Joi.object({
  code: Joi.string().required(),
  reduction: Joi.number().required().min(1).max(100),
  start_at: Joi.date().optional(),
  end_at: Joi.date().optional()
});

const getAllPromotionCodes = async (req, res, next) => {
  try {
    const { code } = req.query;

    let queryOptions = {};

    if (code) {
      queryOptions = { code: code };
    }

    const codes = await PromotionCodeMongo.find(queryOptions);
    res.status(200).json(codes);
  } catch (e) {
    console.error('Error fetching promotion codes:', e);
    next(e);
  }
};

const getPromotionCodeById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const promotionCode = await PromotionCodeMongo.findById(id);
    if (promotionCode) {
      res.status(200).json(promotionCode);
    } else {
      res.status(404).json({ message: 'Promotion code not found' });
    }
  } catch (e) {
    console.error('Error fetching promotion code by ID:', e);
    next(e);
  }
};

const createPromotionCode = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const { error } = promotionCodeSchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    const promotionCodePostgres = await PromotionCodePostgres.create(req.body, { transaction });

    const promotionCodeMongo = new PromotionCodeMongo({
      _id: promotionCodePostgres.id,
      ...req.body
    });
    await promotionCodeMongo.save({ session });

    await transaction.commit();
    await session.commitTransaction();
    res.status(201).json(promotionCodePostgres);
  } catch (e) {
    console.error('Error creating promotion code:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

const updatePromotionCode = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const { error } = promotionCodeSchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    const promotionCodePostgres = await PromotionCodePostgres.findByPk(req.params.id);
    if (!promotionCodePostgres) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(404).json({ message: 'Promotion code not found in PostgreSQL' });
    }

    await promotionCodePostgres.update(req.body, { transaction });

    const promotionCodeMongo = await PromotionCodeMongo.findById(req.params.id).session(session);
    if (promotionCodeMongo) {
      Object.assign(promotionCodeMongo, req.body);
      await promotionCodeMongo.save({ session });
    }

    await transaction.commit();
    await session.commitTransaction();
    res.status(200).json(promotionCodePostgres);
  } catch (e) {
    console.error('Error updating promotion code:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

const deletePromotionCode = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const promotionCodePostgres = await PromotionCodePostgres.findByPk(req.params.id);
    if (!promotionCodePostgres) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(404).json({ message: 'Promotion code not found in PostgreSQL' });
    }

    await promotionCodePostgres.destroy({ transaction });

    const promotionCodeMongo = await PromotionCodeMongo.findById(req.params.id).session(session);
    if (promotionCodeMongo) {
      await promotionCodeMongo.remove({ session });
    }

    await transaction.commit();
    await session.commitTransaction();
    res.status(204).send();
  } catch (e) {
    console.error('Error deleting promotion code:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

module.exports = {
  getAllPromotionCodes,
  getPromotionCodeById,
  createPromotionCode,
  updatePromotionCode,
  deletePromotionCode,
};
