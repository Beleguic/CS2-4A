const path = require('path');
const fs = require('fs');
const Product = require('../mongo/models/Product');
const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  price: Joi.number().greater(0).required(),
  image: Joi.string().optional(),
  is_active: Joi.boolean().optional(),
  description: Joi.string().min(3).required(),
  is_adult: Joi.boolean().optional(),
  reference: Joi.string().required(),
  tva: Joi.number().required(),
});

const getAllProductsWithStock = async (req, res, next) => {
  try {
    const products = await Product.find().populate('stocks', 'quantity');
    const productsWithStock = products.map(product => ({
      id: product.id,
      name: product.name,
      stock: product.stocks.reduce((acc, stock) => acc + stock.quantity, 0),
    }));
    res.json(productsWithStock);
  } catch (e) {
    console.error('Error fetching products with stock:', e);
    next(e);
  }
};

const getAllProductsForSelection = async (req, res, next) => {
  try {
    const products = await Product.find().select('id name');
    res.json(products);
  } catch (e) {
    console.error('Error fetching product list:', e);
    next(e);
  }
};

const getAllProducts = async (req, res, next) => {
  const isFrontend = req.query.frontend === 'true';
  const isSorting = req.query.sorting === 'true';
  const sortField = req.query.sortField || 'name';
  const sortOrder = req.query.sortOrder === 'desc' ? 'desc' : 'asc';
  try {
    if (isFrontend && isSorting) {
      const products = await Product.find({ is_active: true })
        .populate('categories', 'id name')
        .populate('stocks', 'quantity')
        .sort({ [sortField]: sortOrder });

      const productsWithStock = products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
        is_active: product.is_active,
        is_adult: product.is_adult,
        created_at: product.created_at,
        updated_at: product.updated_at,
        reference: product.reference,
        tva: product.tva,
        categories: product.categories,
        stock: product.stocks.reduce((total, stock) => total + stock.quantity, 0),
      }));

      res.json(productsWithStock);
    } else {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const count = await Product.countDocuments();
      const products = await Product.find().skip(offset).limit(limit).sort({ [sortField]: sortOrder });

      res.json({
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        products,
      });
    }
  } catch (e) {
    console.error('Error fetching products:', e);
    next(e);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const isFrontend = req.query.frontend === 'true';
    const whereCondition = isFrontend ? { is_active: true, name: id } : { _id: id };

    const product = await Product.findOne(whereCondition);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
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

    const image = req.file ? req.file.path : null;
    const newProductData = {
      ...req.body,
      image,
    };

    const product = new Product(newProductData);
    await product.save();
    res.status(201).json(product);
  } catch (e) {
    console.error('Error creating product:', e);
    next(e);
  }
};


const updateProduct = async (req, res, next) => {
  try {
    const { created_at, updated_at, ...payload } = req.body;

    const { error } = productSchema.validate(payload);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const product = await Product.findById(req.params.id);
    if (product) {
      const image = req.file ? req.file.path : product.image;
      Object.assign(product, payload, { image });
      await product.save();
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (e) {
    console.error('Error updating product:', e);
    next(e);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.remove();
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Product not found' });
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
