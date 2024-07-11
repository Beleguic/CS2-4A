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
      image: Joi.string().required(),
    })
  ).required(),
  expired_at: Joi.date().optional(),
  updated_at: Joi.date().optional()
});

const getAllCarts = async (req, res, next) => {
  try {
    const { user_id } = req.query;

    const queryOptions = {
      include: [
        { model: User, as: 'user', attributes: ['id'] }
      ]
    };

    let carts;
    if (user_id) {
      queryOptions.where = { user_id: user_id };
      carts = await Cart.findAll(queryOptions);
    } else {
      carts = await Cart.findAll(queryOptions);
    }

    const cartData = carts.map(cart => {
      return {
        ...cart.toJSON(),
        cartProductsData: cart.cartProductsData.map(product => ({
          product_id: product.product_id,
          name: product.name,
          quantity: product.quantity,
          price: product.price,
          image: product.image
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
        { model: User, as: 'user', attributes: ['id'] }
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
    return res.status(400);
  }

  try {
    const newCart = await Cart.create({
      user_id: value.user_id,
      cartProductsData: value.cartProductsData,
      expired_at: new Date(Date.now() + 15 * 60 * 1000)
    });
    res.status(201);
  } catch (err) {
    next(err);
  }
};

const updateCart = async (req, res, next) => {
  const { error, value } = cartSchema.validate(req.body);

  if (error) {
    return res.status(400);
  }

  const { id } = req.params;
  try {
    const updatedCart = await Cart.update(
      {
        cartProductsData: value.cartProductsData,
      },
      {
        where: { id },
        returning: true,
      }
    );

    if (updatedCart[0] === 0) {
      return res.status(404);
    }

    res.status(200).json(updatedCart[1][0]);
  } catch (err) {
    next(err);
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
