const express = require('express');
const { Product, Stock } = require('../models');
const router = express.Router();
const Joi = require('joi');

// Product schema validation
const productSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  brand: Joi.string().min(3).max(255).required(),
  price: Joi.number().greater(0).required(),
  image: Joi.string().uri().required(),
  is_active: Joi.boolean().optional()
});


router.get('/products-with-stock', async (req, res, next) => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          model: Stock,
          as: 'stocks',
          attributes: ['quantity']
        }
      ]
    });

    const productsWithStock = products.map(product => {
      return {
        id: product.id,
        name: product.name,
        stock: product.stocks.reduce((acc, stock) => acc + stock.quantity, 0)
      };
    });

    res.json(productsWithStock);
  } catch (e) {
    console.error('Error fetching products with stock:', e);
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

// Get all products
router.get('/', async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (e) {
    console.error('Error fetching products:', e);
    next(e);
  }
});

// Get product by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Product.findByPk(id);

    if (product) {
      res.json(product);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching product by ID:', e);
    next(e);
  }
});

// Create new product
router.post('/new', async (req, res, next) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (e) {
    console.error('Error creating product:', e);
    next(e);
  }
});

// Update product
router.patch('/:id', async (req, res, next) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const product = await Product.findByPk(req.params.id);

    if (product) {
      await product.update(req.body);
      res.json(product);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating product:', e);
    next(e);
  }
});

// Delete product
router.delete('/:id', async (req, res, next) => {
  try {
    const nbDeleted = await Product.destroy({
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
    console.error('Error deleting product:', e);
    next(e);
  }
});

module.exports = router;
