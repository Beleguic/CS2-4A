const { join } = require('path');
const { Product, Stock, Category } = require('../models');
const readService = require('../services/readService');
const denormalizationService = require('../services/denormalizationService');
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
  brand: Joi.string().optional(),
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
    // Utiliser MongoDB pour les lectures
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      category_id: req.query.category_id,
      is_adult: req.query.is_adult !== undefined ? req.query.is_adult === 'true' : undefined,
      has_promotion: req.query.has_promotion === 'true',
      search: req.query.search,
      low_stock: req.query.low_stock === 'true',
      brand: req.query.brand
    };

    const products = await readService.getAllProducts(filters);
    
    // Formater la réponse pour correspondre à l'API existante
    const formattedProducts = products.map(product => ({
      id: product._id,
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
      brand: product.brand,
      categories: product.categories,
      stock: product.stock?.quantity || 0,
      final_price: product.final_price,
      has_active_promotion: product.has_active_promotion
    }));

    res.json(formattedProducts);
  } catch (e) {
    console.error('Error fetching products:', e);
    next(e);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Utiliser MongoDB pour la lecture
    const product = await readService.getProductById(id);

    if (product) {
      // Formater la réponse pour correspondre à l'API existante
      const formattedProduct = {
        id: product._id,
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
        stock: product.stock,
        promotions: product.promotions,
        final_price: product.final_price,
        has_active_promotion: product.has_active_promotion
      };
      
      res.json(formattedProduct);
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

    // Utiliser PostgreSQL pour l'écriture
    const product = await Product.create(newProductData);
    
    // Synchroniser vers MongoDB
    await denormalizationService.syncProduct(product.id);
    
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
      
      // Synchroniser vers MongoDB
      await denormalizationService.syncProduct(product.id);
      
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
      // Supprimer de MongoDB aussi
      const mongoDb = require('../mongo');
      await mongoDb.Product.findByIdAndDelete(req.params.id);
      
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