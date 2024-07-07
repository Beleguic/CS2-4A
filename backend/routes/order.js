const express = require('express');
const { Order, User, Product } = require('../models');
const router = express.Router();
const Joi = require('joi');

// Order schema validation
const orderSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  products: Joi.array().items(Joi.object({
    product_id: Joi.string().uuid().required(),
    quantity: Joi.number().integer().min(1).required(),
  })).required(),
});

// Get all orders
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: User, attributes: ['id', 'username', 'email'] }]
    });
    res.json(orders);
  } catch (e) {
    console.error('Error fetching orders:', e);
    console.error(e);  // Log the complete error for debugging
    next(e);
  }
});

// Get order by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const order = await Order.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'username', 'email'] }]
    });

    if (order) {
      res.json(order);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching order by ID:', e);
    console.error(e);  // Log the complete error for debugging
    next(e);
  }
});

// Create new order
router.post('/new', async (req, res, next) => {
  try {
    const { error } = orderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (e) {
    console.error('Error creating order:', e);
    console.error(e);  // Log the complete error for debugging
    next(e);
  }
});

// Update order
router.patch('/:id', async (req, res, next) => {
  try {
    const { created_at, ...updateData } = req.body;

    const { error } = orderSchema.validate(updateData);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const order = await Order.findByPk(req.params.id);

    if (order) {
      await order.update(updateData);
      res.json(order);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating order:', e);
    console.error(e);  // Log the complete error for debugging
    next(e);
  }
});

// Delete order
router.delete('/:id', async (req, res, next) => {
  try {
    const nbDeleted = await Order.destroy({
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
    console.error('Error deleting order:', e);
    console.error(e);  // Log the complete error for debugging
    next(e);
  }
});

module.exports = router;
