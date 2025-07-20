const { CategoryProduct, Category, Product } = require('../models');
const readService = require('../services/readService');
const denormalizationService = require('../services/denormalizationService');
const Joi = require('joi');

// CategoryProduct schema validation
const categoryProductSchema = Joi.object({
  category_id: Joi.string().uuid().required(),
  product_id: Joi.string().uuid().required()
});

const getAllCategoryProducts = async (req, res, next) => {
  try {
    // Utiliser MongoDB pour les lectures
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      category_id: req.query.category_id,
      product_id: req.query.product_id
    };

    const categoryProducts = await readService.getAllCategoryProducts(filters);
    
    // Formater la réponse
    const formattedCategoryProducts = categoryProducts.map(categoryProduct => ({
      id: categoryProduct._id,
      category_id: categoryProduct.category_id,
      product_id: categoryProduct.product_id,
      created_at: categoryProduct.created_at,
      updated_at: categoryProduct.updated_at,
      category: categoryProduct.category,
      product: categoryProduct.product
    }));

    res.json(formattedCategoryProducts);
  } catch (e) {
    console.error('Error fetching category products:', e);
    next(e);
  }
};

const getCategoryProductById = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Utiliser MongoDB pour la lecture
    const categoryProduct = await readService.getCategoryProductById(id);

    if (categoryProduct) {
      // Formater la réponse
      const formattedCategoryProduct = {
        id: categoryProduct._id,
        category_id: categoryProduct.category_id,
        product_id: categoryProduct.product_id,
        created_at: categoryProduct.created_at,
        updated_at: categoryProduct.updated_at,
        category: categoryProduct.category,
        product: categoryProduct.product
      };
      
      res.json(formattedCategoryProduct);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching category product by ID:', e);
    next(e);
  }
};

const createCategoryProduct = async (req, res, next) => {
  try {
    const { error } = categoryProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Utiliser PostgreSQL pour l'écriture
    const categoryProduct = await CategoryProduct.create(req.body);
    
    // Synchroniser vers MongoDB
    await denormalizationService.syncCategory(categoryProduct.category_id);
    await denormalizationService.syncProduct(categoryProduct.product_id);
    
    res.status(201).json(categoryProduct);
  } catch (e) {
    console.error('Error creating category product:', e);
    next(e);
  }
};

const updateCategoryProduct = async (req, res, next) => {
  try {
    const { error } = categoryProductSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const categoryProduct = await CategoryProduct.findByPk(req.params.id);

    if (categoryProduct) {
      await categoryProduct.update(req.body);
      
      // Synchroniser vers MongoDB
      await denormalizationService.syncCategory(categoryProduct.category_id);
      await denormalizationService.syncProduct(categoryProduct.product_id);
      
      res.json(categoryProduct);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating category product:', e);
    next(e);
  }
};

const deleteCategoryProduct = async (req, res, next) => {
  try {
    const categoryProduct = await CategoryProduct.findByPk(req.params.id);
    
    if (!categoryProduct) {
      return res.sendStatus(404);
    }

    const nbDeleted = await CategoryProduct.destroy({
      where: {
        id: req.params.id,
      },
    });
    
    if (nbDeleted === 1) {
      // Supprimer de MongoDB aussi
      const mongoDb = require('../mongo');
      await mongoDb.CategoryProduct.findByIdAndDelete(req.params.id);
      
      // Synchroniser les entités liées
      await denormalizationService.syncCategory(categoryProduct.category_id);
      await denormalizationService.syncProduct(categoryProduct.product_id);
      
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error deleting category product:', e);
    next(e);
  }
};

module.exports = {
  getAllCategoryProducts,
  getCategoryProductById,
  createCategoryProduct,
  updateCategoryProduct,
  deleteCategoryProduct,
};
