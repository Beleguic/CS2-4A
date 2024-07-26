const { Category: CategoryPostgres, sequelize } = require('../models');
const CategoryMongo = require('../mongo/models/Category');
const Joi = require('joi');
const mongoose = require('mongoose');

// Schéma de validation de catégorie
const categorySchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  url: Joi.string().regex(/^[a-zA-Z0-9-]+$/).required(),
  description: Joi.string().optional(),
  image: Joi.string().optional(),
  is_active: Joi.boolean().optional()
});

const getAllCategoriesForSelection = async (req, res, next) => {
  try {
    const categories = await CategoryMongo.find({}, { _id: 1, name: 1 });
    res.status(200).json(categories);
  } catch (e) {
    console.error('Error fetching category list:', e);
    next(e);
  }
};

const getAllCategories = async (req, res, next) => {
  const isFrontend = req.query.frontend === 'true';
  const isSorting = req.query.sorting === 'true';
  const url = req.query.url;
  
  let whereCondition = {};

  if (isFrontend) {
    whereCondition.is_active = true;
    if (url) {
      whereCondition.url = url;
    }
  }

  const attributesCondition = isFrontend && isSorting ? ['name'] : undefined;

  try {
    const categories = await CategoryMongo.find(whereCondition, attributesCondition);
    res.status(200).json(categories);
  } catch (e) {
    console.error('Error fetching categories:', e);
    next(e);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await CategoryMongo.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { error } = categorySchema.validate(req.body);
    if (error) {
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    const categoryMongo = new CategoryMongo(req.body);
    await categoryMongo.save({ session });

    await session.commitTransaction();
    res.status(201).json(categoryMongo);
  } catch (e) {
    console.error('Error creating category:', e);
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

const updateCategory = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { error } = categorySchema.validate(req.body);
    if (error) {
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    const categoryMongo = await CategoryMongo.findById(req.params.id).session(session);
    if (!categoryMongo) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Category not found' });
    }

    Object.assign(categoryMongo, req.body);
    await categoryMongo.save({ session });

    await session.commitTransaction();
    res.json(categoryMongo);
  } catch (e) {
    console.error('Error updating category:', e);
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

const deleteCategory = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const categoryMongo = await CategoryMongo.findById(req.params.id).session(session);
    if (!categoryMongo) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Category not found' });
    }

    await categoryMongo.remove({ session });

    await session.commitTransaction();
    res.status(204).send();
  } catch (e) {
    console.error('Error deleting category:', e);
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

module.exports = {
  getAllCategoriesForSelection,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
