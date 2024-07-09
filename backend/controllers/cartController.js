const { Cart, User, Product, Stock } = require('../models');
const Joi = require('joi');

// Cart schema validation
const cartSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  cartProductsData: Joi.array().items(
    Joi.object({
      product_id: Joi.string().uuid().required(),
      name: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      price: Joi.number().required(),
    })
  ).required(),
  updated_at: Joi.date().required()
});

const getAllCarts = async (req, res, next) => {
  try {
    const carts = await Cart.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'username'] }
      ]
    });
    const cartData = carts.map(cart => {
      return {
        ...cart.toJSON(),
        cartProductsData: cart.cartProductsData.map(product => ({
          product_id: product.product_id,
          name: product.name,
          quantity: product.quantity,
          price: product.price
        })),
        user: cart.user
      };
    });
    res.json(cartData);
  } catch (e) {
    console.error('Error fetching carts:', e);
    next(e);
  }
};

const getCartById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const cart = await Cart.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username'] }
      ]
    });

    if (cart) {
      res.json(cart);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching cart by ID:', e);
    next(e);
  }
};

const createCart = async (req, res, next) => {
  const { error, value } = cartSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    console.log('Creating new cart with:', value.cartProductsData);  // Debugging
    const newCart = await Cart.create({
      user_id: value.user_id,
      cartProductsData: value.cartProductsData,
      expired_at: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
    });
    res.status(201).json(newCart);
  } catch (err) {
    next(err);
  }
};

const updateCart = async (req, res, next) => {
  try {
    const { created_at, updated_at, user, ...payload } = req.body;

    const { error } = cartSchema.validate(payload);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const cart = await Cart.findByPk(req.params.id);
    if (cart) {
      const { products } = payload;
      for (let product of products) {
        const stock = await Stock.findOne({ where: { product_id: product.product_id } });
        if (!stock || stock.quantity < product.quantity) {
          return res.status(400).json({ error: `Insufficient stock for product ID ${product.product_id}` });
        }

        const productDetails = await Product.findByPk(product.product_id, {
          attributes: ['name']
        });
        if (productDetails) {
          product.name = productDetails.name;
        }
      }

      await cart.update({ ...payload, cartProductsData: products });

      for (let product of products) {
        await Stock.decrement('quantity', {
          by: product.quantity,
          where: { product_id: product.product_id }
        });
      }

      res.json(cart);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating cart:', e);
    next(e);
  }
};

const deleteCart = async (req, res, next) => {
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
};

module.exports = {
  getAllCarts,
  getCartById,
  createCart,
  updateCart,
  deleteCart,
};
