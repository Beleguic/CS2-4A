const { ProductPromotion: ProductPromotionPostgres, sequelize } = require('../models');
const ProductPromotionMongo = require('../mongo/models/ProductPromotion');
const Joi = require('joi');
const mongoose = require('mongoose');

const productPromotionSchema = Joi.object({
  product_id: Joi.string().guid({ version: 'uuidv4' }).required(),
  start_at: Joi.date().required(),
  end_at: Joi.date().required(),
});

const getAllProductPromotions = async (req, res, next) => {
  try {
    const productPromotions = await ProductPromotionMongo.find().populate('product_id', 'id name');
    res.status(200).json(productPromotions);
  } catch (e) {
    console.error('Error fetching product promotions:', e);
    next(e);
  }
};

const getProductPromotionById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const productPromotion = await ProductPromotionMongo.findById(id).populate('product_id', 'id name');

    if (productPromotion) {
      res.status(200).json(productPromotion);
    } else {
      res.status(404).json({ message: 'Promotion not found' });
    }
  } catch (e) {
    console.error('Error fetching product promotion by ID:', e);
    next(e);
  }
};

const createProductPromotion = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    console.log('Request body:', req.body);

    const { error } = productPromotionSchema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details[0].message);
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    console.log('Creating promotion in PostgreSQL');
    const promotionPostgres = await ProductPromotionPostgres.create(req.body, { transaction });

    console.log('Creating promotion in MongoDB');
    const promotionMongo = new ProductPromotionMongo({
      _id: promotionPostgres.id,
      product_id: mongoose.Types.ObjectId(req.body.product_id),
      start_at: req.body.start_at,
      end_at: req.body.end_at
    });
    await promotionMongo.save({ session });

    await transaction.commit();
    await session.commitTransaction();
    console.log('Promotion created successfully');
    res.status(201).json(promotionPostgres);
  } catch (e) {
    console.error('Error creating product promotion:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};



const updateProductPromotion = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const { error } = productPromotionSchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    const promotionPostgres = await ProductPromotionPostgres.findByPk(req.params.id);
    if (!promotionPostgres) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(404).json({ message: 'Promotion not found in PostgreSQL' });
    }

    await promotionPostgres.update(req.body, { transaction });

    const promotionMongo = await ProductPromotionMongo.findById(req.params.id).session(session);
    if (promotionMongo) {
      promotionMongo.product_id = mongoose.Types.ObjectId(req.body.product_id);
      promotionMongo.start_at = req.body.start_at;
      promotionMongo.end_at = req.body.end_at;
      await promotionMongo.save({ session });
    }

    await transaction.commit();
    await session.commitTransaction();
    res.status(200).json(promotionPostgres);
  } catch (e) {
    console.error('Error updating product promotion:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

const deleteProductPromotion = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const promotionPostgres = await ProductPromotionPostgres.findByPk(req.params.id);
    if (!promotionPostgres) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(404).json({ message: 'Promotion not found in PostgreSQL' });
    }

    await promotionPostgres.destroy({ transaction });

    const promotionMongo = await ProductPromotionMongo.findById(req.params.id).session(session);
    if (promotionMongo) {
      await promotionMongo.remove({ session });
    }

    await transaction.commit();
    await session.commitTransaction();
    res.status(204).send();
  } catch (e) {
    console.error('Error deleting product promotion:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

module.exports = {
  getAllProductPromotions,
  getProductPromotionById,
  createProductPromotion,
  updateProductPromotion,
  deleteProductPromotion,
};
