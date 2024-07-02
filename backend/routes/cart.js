const express = require('express');
const { Cart, Product } = require('../models');
const router = express.Router();
const Joi = require('joi');

// Cart schema validation
const cartSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  products: Joi.array().items(
    Joi.object({
      product_id: Joi.string().uuid().required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ).required(),
  expire_at: Joi.date().optional()
});

// Get all carts
router.get('/', async (req, res, next) => {
  try {
    const carts = await Cart.findAll();
    res.json(carts);
  } catch (e) {
    console.error('Error fetching carts:', e);
    next(e);
  }
});

// Get all products for selection
router.get('/list', async (req, res, next) => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'name']
    });
    res.json(products);
  } catch (e) {
    console.error('Error fetching product list:', e);
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username'], // Assurez-vous que le champ username existe
    });
    res.json(users);
  } catch (e) {
    console.error('Error fetching users:', e);
    next(e);
  }
});

// Get cart by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const cart = await Cart.findByPk(id);

    if (cart) {
      res.json(cart);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching cart by ID:', e);
    next(e);
  }
});

// Create new cart
router.post('/new', async (req, res, next) => {
  try {
    const { error } = cartSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const cart = await Cart.create(req.body);
    res.status(201).json(cart);
  } catch (e) {
    console.error('Error creating cart:', e);
    next(e);
  }
});

// Update cart
router.patch('/:id', async (req, res, next) => {
  try {
    // Exclude `created_at` from the request body
    const { created_at, ...updateData } = req.body;

    const { error } = cartSchema.validate(updateData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const cart = await Cart.findByPk(req.params.id);

    if (cart) {
      await cart.update(updateData);
      res.json(cart);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating cart:', e);
    next(e);
  }
});

// Delete cart
router.delete('/:id', async (req, res, next) => {
  try {
    const nbDeleted = await Cart.destroy({
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
    console.error('Error deleting cart:', e);
    next(e);
  }
});

module.exports = router;
