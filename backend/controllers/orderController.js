const { Order, User, Product } = require('../models');
const Joi = require('joi');

// Order schema validation
const orderSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  products: Joi.array().items(
    Joi.object({
      product_id: Joi.string().uuid().required(),
      name: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().required(),
      image: Joi.string().required(),
      reference: Joi.string().required(),
      is_adult: Joi.bool().required(),
      tva: Joi.number().required(),
    })
  ).required(),
});

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: User, attributes: ['id', 'username', 'email'] }]
    });
    res.json(orders);
  } catch (e) {
    console.error('Error fetching orders:', e);
    next(e);
  }
};

const getOrderById = async (req, res, next) => {
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
    next(e);
  }
};

const createOrder = async (req, res, next) => {
  try {
    const { error } = orderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (e) {
    console.error('Error creating order:', e);
    next(e);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const { created_at, updated_at, User, ...updateData } = req.body;

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
    next(e);
  }
};

const deleteOrder = async (req, res, next) => {
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
    next(e);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
