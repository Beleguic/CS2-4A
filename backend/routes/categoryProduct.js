const express = require('express');
const { CategoryProduct, Category, Product } = require('../models');
const router = express.Router();
const Joi = require('joi');

// CategoryProduct schema validation
const categoryProductSchema = Joi.object({
  category_id: Joi.string().uuid().required(),
  product_id: Joi.string().uuid().required(),
});

// Get all category products
router.get('/', async (req, res, next) => {
  try {
    const categoryProducts = await CategoryProduct.findAll({
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Product, as: 'product', attributes: ['id', 'name'] }
      ]
    });
    res.json(categoryProducts);
  } catch (e) {
    console.error('Error fetching category products:', e);
    next(e);
  }
});

// Get category product by ID
router.get('/:id', async (req, res, next) => {
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
    console.error('Error fetching category product by ID:', e);
    next(e);
  }
});

// Create new category product
router.post('/new', async (req, res, next) => {
  try {
    const { error } = categoryProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const categoryProduct = await CategoryProduct.create(req.body);
    res.status(201).json(categoryProduct);
  } catch (e) {
    console.error('Error creating category product:', e);
    next(e);
  }
});

// Update category product
router.patch('/:id', async (req, res, next) => {
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
    console.error('Error updating category product:', e);
    next(e);
  }
});

// Delete category product
router.delete('/:id', async (req, res, next) => {
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
    console.error('Error deleting category product:', e);
    next(e);
  }
});

module.exports = router;
