const express = require('express');
const { Category } = require('../models');
const router = express.Router();
const Joi = require('joi');

// Category schema validation
const categorySchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  url: Joi.string().regex(/^[a-zA-Z0-9-]+$/).required(),
  description: Joi.string().optional(),
  image: Joi.string().optional(),
  is_active: Joi.boolean().optional()
});

// Get all categories for selection
router.get('/list', async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name']
    });
    res.json(categories);
  } catch (e) {
    console.error('Error fetching category list:', e);
    next(e);
  }
});

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (e) {
    console.error('Error fetching categories:', e);
    next(e);
  }
});

// Get category by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const category = await Category.findByPk(id);

    if (category) {
      res.json(category);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching category by ID:', e);
    next(e);
  }
});

// Create new category
router.post('/new', async (req, res, next) => {
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
});

// Update category
router.patch('/:id', async (req, res, next) => {
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
});

// Delete category
router.delete('/:id', async (req, res, next) => {
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
});

module.exports = router;
