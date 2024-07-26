const { join } = require('path');
const { Product, Stock, Category, User } = require('../models');
const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  price: Joi.number().greater(0).required(),
  is_active: Joi.boolean().optional(),
  description: Joi.string().min(3).required(),
  is_adult: Joi.boolean().optional(),
  reference: Joi.string().required(),
  tva: Joi.number().required(),
  image: Joi.string().optional(),
});

const isAdmin = (user) => user.role === 'admin';

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

    return res.sttaus(200).json(productsWithStock);
  } catch (e) {
    return res.sendStatus(404);
  }
};

const getAllProductsForSelection = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      attributes: ['id', 'name']
    });
    return res.sendStatus(200).json(products);
  } catch (e) {
    return res.sendStatus(404);
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
      
      return res.status(200).json(productsWithStock);
    } else {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const { count, rows } = await Product.findAndCountAll({
        offset: offset,
        limit: limit,
        order: [[sortField, sortOrder]]
      });

      return res.status(200).json({
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        products: rows
      });
    }
    
  } catch (e) {
    return res.status(500).json({ error: 'Internal Server Error' });
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

    if (!product) {
      return res.sendStatus(404);
    }

    return res.status(200).json(product);
  } catch (e) {
    return res.sendStatus(404);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const requestingUser = await User.findByPk(req.userData.userId);

    if (!isAdmin(requestingUser)){
      return res.sendStatus(404)
    }

    const { error } = productSchema.validate(req.body);

    console.log("error", error)

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const image = req.file ? req.file.path : null;

    const newProductData = {
      ...req.body,
      image,
    };

    const product = await Product.create(newProductData);

    return res.status(201).json(product);
  } catch (e) {
    return res.sendStatus(404);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const requestingUser = await User.findByPk(req.params.id);

    if (!isAdmin(requestingUser)){
      return res.status(404);
    }
    
    const { created_at, updated_at, ...payload } = req.body;

    const { error } = productSchema.validate(payload);
    if (error) {
      return res.sendStatus(400);
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.sendStatus(404);
    }

    const image = req.file ? req.file.path : product.image;
    await product.update({ ...payload, image });

    return res.status(200).json(product);
  } catch (e) {
    return res.sendStatus(500);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const requestingUser = await User.findByPk(req.userData.userId);

    if (!isAdmin(requestingUser)){
      return res.sendStatus(404);
    }

    const nbDeleted = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });

    console.log('nbDeleted', nbDeleted);

    if (nbDeleted === 1) {
      return res.sendStatus(204);
    } else {
      return res.sendStatus(404);
    }
  } catch (e) {
    return res.sendStatus(404);
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