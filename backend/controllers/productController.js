const { join } = require('path');
const { Product, Stock, Category } = require('../models');
const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  price: Joi.number().greater(0).required(),
  image: Joi.string().optional(), // L'image devient optionnelle car elle sera gérée par Multer
  is_active: Joi.boolean().optional(),
  description: Joi.string().min(3).required(),
  is_adult: Joi.boolean().optional(),
  reference: Joi.string().required(),
  tva: Joi.number().required(),
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
  const isFrontend = req.query.frontend === 'true';
  const isSorting = req.query.sorting === 'true';
  const sortField = req.query.sortField || 'name';
  const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';
  try {
    if (isFrontend && isSorting) {
      const products = await Product.findAll({
        where: {
          is_active: true
        },
        include: [
          {
            model: Category,
            as: 'categories',
            through: {
              attributes: []
            },
            attributes: ['id', 'name']
          },
          {
            model: Stock,
            as: 'stocks',
            attributes: ['quantity']
          }
        ],
        order: [[sortField, sortOrder]]
      });

      const productsWithStock = products.map(product => {
        const totalStock = product.stocks.reduce((total, stock) => total + stock.quantity, 0);
        return {
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
          stock: totalStock
        };
      });

      res.json(productsWithStock);
    } else {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await Product.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [[sortField, sortOrder]]
      });

      res.json({
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        products: rows
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
    const whereCondition = isFrontend
      ? { is_active: true, name: id }
      : { id: id };

    const product = await Product.findOne({
      where: whereCondition,
    });

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

    const image = req.file ? req.file.path : null;
    const newProductData = {
      ...req.body,
      image,
    };

    const product = await Product.create(newProductData);
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

    const product = await Product.findByPk(req.params.id);
    if (product) {
      const image = req.file ? req.file.path : product.image; // Conserve l'ancienne image si une nouvelle n'est pas fournie
      await product.update({ ...payload, image });
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