const { Category } = require('../models');
const Joi = require('joi');

// Category schema validation
const categorySchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  url: Joi.string().regex(/^[a-zA-Z0-9-]+$/).required(),
  description: Joi.string().optional(),
  image: Joi.string().optional(),
  is_active: Joi.boolean().optional()
});

const getAllCategoriesForSelection = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name']
    });
    res.json(categories);
  } catch (e) {
    console.error('Error fetching category list:', e);
    next(e);
  }
};

const getAllCategories = async (req, res, next) => {
  const isFrontend = req.query.frontend === 'true';
  const whereCondition = isFrontend ? { is_active: true } : {};
  try {
    const categories = await Category.findAll({
      where: {
        ...whereCondition
      }
    });
    res.json(categories);
  } catch (e) {
    console.error('Error fetching categories:', e);
    next(e);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const isFrontend = req.query.frontend === 'true';
    const whereCondition = isFrontend
      ? { is_active: true, name: id }
      : { id: id };

    const category = await Category.findOne({
      where: whereCondition,
    });

    if (category) {
      res.json(category);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching category by ID:', e);
    next(e);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (e) {
    console.error('Error creating category:', e);
    next(e);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const category = await Category.findByPk(req.params.id);

    if (category) {
      await category.update(req.body);
      res.json(category);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating category:', e);
    next(e);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const nbDeleted = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (nbDeleted === 1) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error deleting category:', e);
    next(e);
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
