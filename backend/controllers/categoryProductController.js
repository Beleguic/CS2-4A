const { CategoryProduct, Category, Product } = require('../models');
const Joi = require('joi');

// CategoryProduct schema validation
const categoryProductSchema = Joi.object({
  category_id: Joi.string().uuid().required(),
  product_id: Joi.string().uuid().required(),
});

const getAllCategoryProducts = async (req, res, next) => {
  try {
    const categoryProducts = await CategoryProduct.findAll({
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Product, as: 'product', attributes: ['id', 'name'] }
      ]
    });
    res.json(categoryProducts);
  } catch (e) {
    next(e);
  }
};

const getCategoryProductById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const categoryProduct = await CategoryProduct.findByPk(id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Product, as: 'product', attributes: ['id', 'name'] }
      ]
    });

    if (categoryProduct) {
      res.json(categoryProduct);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
};

const createCategoryProduct = async (req, res, next) => {
  try {
    const { error } = categoryProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const categoryProduct = await CategoryProduct.create(req.body);
    res.status(201).json(categoryProduct);
  } catch (e) {
    next(e);
  }
};

const updateCategoryProduct = async (req, res, next) => {
  try {
    const { error } = categoryProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const categoryProduct = await CategoryProduct.findByPk(req.params.id);

    if (categoryProduct) {
      await categoryProduct.update(req.body);
      res.json(categoryProduct);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
};

const deleteCategoryProduct = async (req, res, next) => {
  try {
    const nbDeleted = await CategoryProduct.destroy({
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
    next(e);
  }
};

module.exports = {
  getAllCategoryProducts,
  getCategoryProductById,
  createCategoryProduct,
  updateCategoryProduct,
  deleteCategoryProduct,
};
