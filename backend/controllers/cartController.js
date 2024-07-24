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
      reference: Joi.string().required(),
      is_adult: Joi.bool().required(),
      tva: Joi.number().required(),
    })
  ).required(),
  expired_at: Joi.date().optional(),
  updated_at: Joi.date().optional()
});

const isAdmin = (user) => user.role === 'admin';

const getAllCarts = async (req, res, next) => {
  try {
    const { user_id } = req.query;
    const user = await User.findByPk(req.userData.userId);

    if((!user) || (user.id !== user_id)){
      return res.sendStatus(404);
    }

    const queryOptions = {
      include: [
        { model: User, as: 'user', attributes: ['id'] }
      ]
    };

    let carts;
    if (!isAdmin(user)) {
      queryOptions.where = { user_id: user.id };
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
          image: product.image,
          reference: product.reference,
          is_adult: product.is_adult,
          tva: product.tva
        })),
        user: cart.user
      };
    });

    return res.status(200).json(cartData);
  } catch (e) {
    return res.sendStatus(500);
  }
};

const getCartById = async (req, res, next) => {
  try {
    const userId = req.userData.userId;
    const user = await User.findByPk(userId);
    const cartId = req.params.id;

    let cart;

    if ((!user) || (!cartId)) {
      return res.sendStatus(404);
    }

    if (isAdmin(user)) {
      cart = await Cart.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['id'] }
        ]
      });
    } else {
      cart = await Cart.findOne({
        where: { id: cartId, user_id: userId },
        include: [
          { model: User, as: 'user', attributes: ['id'] }
        ]
      });
    }

    if (!cart) {
      return res.sendStatus(404);
    }

    return res.status(200).json(cart);
  } catch (e) {
    return res.sendStatus(500);
  }
};

const createCart = async (req, res, next) => {
  try {
    const { error, value } = cartSchema.validate(req.body);

    if (error) {
      return res.sendStatus(400);
    }

    const newCart = await Cart.create({
      user_id: value.user_id,
      cartProductsData: value.cartProductsData,
      expired_at: new Date(Date.now() + 15 * 60 * 1000)
    });

    if(!newCart){
      return res.sendStatus(404);
    } 
    return res.sendStatus(201);
    
  } catch (err) {
    return res.sendStatus(500);
  }
};

const updateCart = async (req, res, next) => {
  const { error, value } = cartSchema.validate(req.body);

  if (error) {
    return res.status(404);
  }

  const cartId = req.params.id;
  const userId = req.userData.userId;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.sendStatus(404);
    }

    let whereCondition;

    if (isAdmin(user)) {
      whereCondition = { id: cartId };
    } else {
      whereCondition = { id: cartId, user_id: userId };
    }

    const [affectedRows, [updatedCart]] = await Cart.update(
      {
        cartProductsData: value.cartProductsData,
      },
      {
        where: whereCondition,
        returning: true,
      }
    );

    if (affectedRows === 0) {
      return res.sendStatus(404);
    }

    return res.status(200).json(updatedCart);
  } catch (err) {
    return res.sendStatus(500);
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
      return res.sendStatus(204);
    } else {
      return res.sendStatus(404);
    }
  } catch (e) {
    return res.sendStatus(500);
  }
};

const removeProductFromCart = async (req, res, next) => {
  const { user_id, product_id } = req.body;

  try {
    const cart = await Cart.findOne({ where: { user_id } });

    if (!cart) {
      return res.status(404);
    }

    const updatedProducts = cart.cartProductsData.filter(
      (product) => product.product_id !== product_id
    );

    if (updatedProducts.length === cart.cartProductsData.length) {
      return res.status(404)
    }

    cart.cartProductsData = updatedProducts;
    await cart.save();

    return res.status(200).json(cart);
  } catch (e) {
    return res.sendStatus(500);
  }
};

const getTotalProductCount = async (req, res, next) => {
  const { product_id } = req.query;

  if (!product_id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    const carts = await Cart.findAll();

    let totalCount = 0;
    carts.forEach(cart => {
      const product = cart.cartProductsData.find(p => p.product_id === product_id);
      if (product) {
        totalCount += product.quantity;
      }
    });

    return res.status(200).json({ product_id, total_count: totalCount });
  } catch (e) {
    return res.sendStatus(500);
  }
};

const getCartByUserId = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        { model: User, as: 'user', attributes: ['id'] }
      ]
    });

    if (!cart) {
      return res.sendStatus(404);
    }
    return res.status(200).json(cart);
  } catch (e) {
    return res.sendStatus(500);
  }
};

module.exports = {
  getAllCarts,
  getCartById,
  createCart,
  updateCart,
  deleteCart,
  removeProductFromCart,
  getTotalProductCount,
  getCartByUserId
};