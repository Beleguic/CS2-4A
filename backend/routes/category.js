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

// Filter query params
const filterQueryParams = (query) => {
  const validParams = ['name', 'description', 'image', 'is_active'];
  return Object.keys(query)
    .filter(key => validParams.includes(key))
    .reduce((obj, key) => {
      obj[key] = query[key];
      return obj;
    }, {});
};

// Get all categories
router.get('/', async (req, res, next) => {
  try {
    const isFrontend = req.query.frontend === 'true';
    const filteredQuery = filterQueryParams(req.query);
    const whereCondition = isFrontend ? { is_active: true } : {};

    const categories = await Category.findAll({
      where: {
        ...whereCondition,
        ...filteredQuery,
      },
    });
    res.json(categories);
  } catch (e) {
    next(e);
  }
});

// Get category by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const isFrontend = req.query.frontend === 'true';

    const whereCondition = isFrontend
      ? { is_active: true, url: id }
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
    next(e);
  }
});

// Update category
router.patch('/:id', async (req, res, next) => {
  try {
    console.log('Received payload for update:', req.body); // Log received payload

    // Remove fields not allowed in the payload
    const { id, created_at, updated_at, createdAt, updatedAt, ...updateData } = req.body;

    const { error } = categorySchema.validate(updateData);
    if (error) {
      console.error('Validation error:', error.details); // Log validation error details
      return res.status(400).json({ error: error.details[0].message });
    }

    const category = await Category.findByPk(req.params.id);

    if (category) {
      await category.update(updateData);
      res.json(category);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error during category update:', e); // Log the full error
    next(e);
  }
});

// Create new category
router.post('/new', async (req, res, next) => {
  try {
    console.log('Received payload for new category:', req.body); // Log received payload
    const { error } = categorySchema.validate(req.body);
    if (error) {
      console.error('Validation error:', error.details); // Log validation error details
      return res.status(400).json({ error: error.details[0].message });
    }

    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (e) {
    console.error('Error during category creation:', e); // Log the full error
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
    next(e);
  }
});

module.exports = router;
