const { Product, Stock } = require('../models');
const Joi = require('joi');

// Product schema validation
const productSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  brand: Joi.string().min(3).max(255).required(),
  price: Joi.number().greater(0).required(),
  image: Joi.string().uri().required(),
  is_active: Joi.boolean().optional()
});

const getAllProductsWithStock = async (req, res, next) => {
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
};

const getAllProductsForSelection = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'name']
    });
    res.json(products);
  } catch (e) {
    console.error('Error fetching product list:', e);
    next(e);
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (e) {
    console.error('Error fetching products:', e);
    next(e);
  }
};

const getProductById = async (req, res, next) => {
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
};

const createProduct = async (req, res, next) => {
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
};

const updateProduct = async (req, res, next) => {
  try {
    // Extract the payload and remove `created_at` and `updated_at` fields
    const { created_at, updated_at, ...payload } = req.body;

    // Validate the payload
    const { error } = productSchema.validate(payload);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Find and update the product
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.update(payload);
      res.json(product);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating product:', e);
    next(e);
  }
};

const deleteProduct = async (req, res, next) => {
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
};

module.exports = {
  getAllProductsWithStock,
  getAllProductsForSelection,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
