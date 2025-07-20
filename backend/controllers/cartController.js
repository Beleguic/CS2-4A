const { Cart, User, Product, Stock } = require('../models');
const readService = require('../services/readService');
const denormalizationService = require('../services/denormalizationService');
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

const getAllCarts = async (req, res, next) => {
  try {
    const { user_id } = req.query;

    // Utiliser MongoDB pour les lectures
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0
    };

    if (user_id) {
      filters.user_id = user_id;
    }

    const carts = await readService.getAllCarts(filters);

    // Formater la réponse
    const cartData = carts.map(cart => ({
      id: cart._id,
      user_id: cart.user_id,
      cartProductsData: cart.items || [],
      total_amount: cart.total_amount,
      created_at: cart.created_at,
      updated_at: cart.updated_at,
      user: cart.user
    }));

    res.json(cartData);
  } catch (e) {
    console.error('Error fetching carts:', e);
    next(e);
  }
};

const getCartById = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Utiliser MongoDB pour la lecture
    const cart = await readService.getCartById(id);

    if (cart) {
      // Formater la réponse
      const formattedCart = {
        id: cart._id,
        user_id: cart.user_id,
        cartProductsData: cart.items || [],
        total_amount: cart.total_amount,
        created_at: cart.created_at,
        updated_at: cart.updated_at,
        user: cart.user
      };
      
      res.json(formattedCart);
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
    // Utiliser PostgreSQL pour l'écriture
    const newCart = await Cart.create({
      user_id: value.user_id,
      cartProductsData: value.cartProductsData,
      expired_at: new Date(Date.now() + 15 * 60 * 1000)
    });
    
    // Synchroniser vers MongoDB
    await denormalizationService.syncCarts();
    
    res.status(201).json(newCart);
  } catch (err) {
    next(err);
  }
};

const updateCart = async (req, res, next) => {
  const { error, value } = cartSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { id } = req.params;
  try {
    const [affectedRows, [updatedCart]] = await Cart.update(
      {
        cartProductsData: value.cartProductsData,
      },
      {
        where: { id },
        returning: true,
      }
    );

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Synchroniser vers MongoDB
    await denormalizationService.syncCarts();

    res.status(200).json(updatedCart);
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
      // Supprimer de MongoDB aussi
      const mongoDb = require('../mongo');
      await mongoDb.Cart.findByIdAndDelete(req.params.id);
      
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error deleting cart:', e);
    next(e);
  }
};

const removeProductFromCart = async (req, res, next) => {
  const { user_id, product_id } = req.body;

  try {
    // Utiliser MongoDB pour la lecture
    const cart = await readService.getCartByUser(user_id);

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const updatedProducts = cart.items.filter(
      (product) => product.product_id !== product_id
    );

    if (updatedProducts.length === cart.items.length) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    // Mettre à jour dans PostgreSQL
    const pgCart = await Cart.findOne({ where: { user_id } });
    if (pgCart) {
      pgCart.cartProductsData = updatedProducts;
      await pgCart.save();
      
      // Synchroniser vers MongoDB
      await denormalizationService.syncCarts();
    }

    res.status(200).json({ items: updatedProducts });
  } catch (e) {
    console.error('Error removing product from cart:', e);
    next(e);
  }
};

const getTotalProductCount = async (req, res, next) => {
  const { product_id } = req.query;

  if (!product_id) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  try {
    // Utiliser MongoDB pour la lecture
    const carts = await readService.getAllCarts({ limit: 1000 });

    let totalCount = 0;
    carts.forEach(cart => {
      const product = cart.items.find(p => p.product_id === product_id);
      if (product) {
        totalCount += product.quantity;
      }
    });

    res.status(200).json({ product_id, total_count: totalCount });
  } catch (e) {
    console.error('Error calculating total product count:', e);
    next(e);
  }
};

const getCartByUserId = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Utiliser MongoDB pour la lecture
    const cart = await readService.getCartByUser(userId);

    if (cart) {
      // Formater la réponse
      const formattedCart = {
        id: cart._id,
        user_id: cart.user_id,
        cartProductsData: cart.items || [],
        total_amount: cart.total_amount,
        created_at: cart.created_at,
        updated_at: cart.updated_at,
        user: cart.user
      };
      
      res.json(formattedCart);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching cart by user ID:', e);
    next(e);
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