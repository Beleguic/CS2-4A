const Category = require('../mongo/models/Category');
const Joi = require('joi');

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
    const categories = await Category.find().select('id name');
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
    const categories = await Category.find(whereCondition)
      .select(attributesCondition)
      .populate(isFrontend ? { path: 'products', select: 'id name' } : null);
    res.status(200).json(categories);
  } catch (e) {
    console.error('Error fetching categories:', e);
    next(e);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id).populate('products');
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
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const category = new Category(req.body);
    await category.save();
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

    const category = await Category.findById(req.params.id);
    if (category) {
      Object.assign(category, req.body);
      await category.save();
      res.status(200).json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (e) {
    console.error('Error updating category:', e);
    next(e);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      await category.remove();
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Category not found' });
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
