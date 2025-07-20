const { Category, Product } = require('../models');
const readService = require('../services/readService');
const denormalizationService = require('../services/denormalizationService');
const Joi = require('joi');

// Category schema validation
const categorySchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  url: Joi.string().regex(/^[a-zA-Z0-9-]+$/).required(),
  description: Joi.string().optional(),
  image: Joi.string().optional(),
  is_active: Joi.boolean().optional()
});

const getAllCategoriesForSelection = async (req, res, next) => {
  try {
    // Utiliser MongoDB pour les lectures
    const categories = await readService.getAllCategories({ limit: 100 });
    
    // Formater pour la sélection (id, name seulement)
    const formattedCategories = categories.map(category => ({
      id: category._id,
      name: category.name
    }));
    
    res.json(formattedCategories);
  } catch (e) {
    console.error('Error fetching category list:', e);
    next(e);
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const isFrontend = req.query.frontend === 'true';
    const isSorting = req.query.sorting === 'true';
    const url = req.query.url;
    
    // Utiliser MongoDB pour les lectures
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0
    };

    if (isFrontend) {
      filters.is_active = true;
    }

    const categories = await readService.getAllCategories(filters);
    
    // Formater la réponse selon les besoins
    let formattedCategories = categories.map(category => ({
      id: category._id,
      name: category.name,
      description: category.description,
      is_active: category.is_active,
      created_at: category.created_at,
      updated_at: category.updated_at,
      products_count: category.products_count,
      products: category.products || []
    }));

    // Filtrer par URL si spécifié
    if (url) {
      formattedCategories = formattedCategories.filter(cat => cat.url === url);
    }

    // Si frontend avec tri, retourner seulement les noms
    if (isFrontend && isSorting) {
      formattedCategories = formattedCategories.map(cat => ({ name: cat.name }));
    }

    res.json(formattedCategories);
  } catch (e) {
    console.error('Error fetching categories:', e);
    next(e);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const isFrontend = req.query.frontend === 'true';
    
    // Utiliser MongoDB pour la lecture
    const category = await readService.getCategoryById(id);

    if (category) {
      // Vérifier si c'est pour le frontend et si la catégorie est active
      if (isFrontend && !category.is_active) {
        return res.sendStatus(404);
      }

      // Formater la réponse
      const formattedCategory = {
        id: category._id,
        name: category.name,
        description: category.description,
        is_active: category.is_active,
        created_at: category.created_at,
        updated_at: category.updated_at,
        products_count: category.products_count,
        products: category.products || []
      };

      res.json(formattedCategory);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching category by ID:', e);
    next(e);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Utiliser PostgreSQL pour l'écriture
    const category = await Category.create(req.body);
    
    // Synchroniser vers MongoDB
    await denormalizationService.syncCategories();
    
    res.status(201).json(category);
  } catch (e) {
    console.error('Error creating category:', e);
    next(e);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const category = await Category.findByPk(req.params.id);

    if (category) {
      await category.update(req.body);
      
      // Synchroniser vers MongoDB
      await denormalizationService.syncCategories();
      
      res.json(category);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating category:', e);
    next(e);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const nbDeleted = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (nbDeleted === 1) {
      // Supprimer de MongoDB aussi
      const mongoDb = require('../mongo');
      await mongoDb.Category.findByIdAndDelete(req.params.id);
      
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error deleting category:', e);
    next(e);
  }
};

module.exports = {
  getAllCategoriesForSelection,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
