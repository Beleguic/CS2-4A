const { Order, User, Product } = require('../models');
const readService = require('../services/readService');
const denormalizationService = require('../services/denormalizationService');
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
    total: Joi.number().required(),
    tva: Joi.number().required(),
    isPayed: Joi.boolean().required(),
    livraison: Joi.string().allow(null),
    adresseFacturation: Joi.any().required(),
});

const getAllOrders = async (req, res, next) => {
  try {
    // Utiliser MongoDB pour les lectures
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      user_id: req.query.user_id,
      status: req.query.status,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };

    const orders = await readService.getAllOrders(filters);
    
    // Formater la réponse
    const formattedOrders = orders.map(order => ({
      id: order._id,
      user_id: order.user_id,
      total_amount: order.total_amount,
      status: order.status,
      shipping_address: order.shipping_address,
      billing_address: order.billing_address,
      payment_method: order.payment_method,
      created_at: order.created_at,
      updated_at: order.updated_at,
      user: order.user
    }));

    res.json(formattedOrders);
  } catch (e) {
    console.error('Error fetching orders:', e);
    next(e);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Utiliser MongoDB pour la lecture
    const order = await readService.getOrderById(id);

    if (order) {
      // Formater la réponse
      const formattedOrder = {
        id: order._id,
        user_id: order.user_id,
        total_amount: order.total_amount,
        status: order.status,
        shipping_address: order.shipping_address,
        billing_address: order.billing_address,
        payment_method: order.payment_method,
        created_at: order.created_at,
        updated_at: order.updated_at,
        user: order.user
      };
      
      res.json(formattedOrder);
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

    // Utiliser PostgreSQL pour l'écriture
    const order = await Order.create(req.body);
    
    // Synchroniser vers MongoDB
    await denormalizationService.syncOrders();
    
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
      
      // Synchroniser vers MongoDB
      await denormalizationService.syncOrders();
      
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
      // Supprimer de MongoDB aussi
      const mongoDb = require('../mongo');
      await mongoDb.Order.findByIdAndDelete(req.params.id);
      
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
