const { Stock, Product } = require('../models');
const readService = require('../services/readService');
const denormalizationService = require('../services/denormalizationService');
const Joi = require('joi');

// Stock schema validation
const stockSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(0).required(),
  alert_threshold: Joi.number().integer().min(0).required(),
  location: Joi.string().optional(),
  last_updated: Joi.date().optional()
});

const getAllStocks = async (req, res, next) => {
  try {
    // Utiliser MongoDB pour les lectures
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      product_id: req.query.product_id,
      low_stock: req.query.low_stock === 'true'
    };

    const stocks = await readService.getAllStocks(filters);
    
    // Formater la réponse
    const formattedStocks = stocks.map(stock => ({
      id: stock._id,
      product_id: stock.product_id,
      quantity: stock.quantity,
      alert_threshold: stock.alert_threshold,
      location: stock.location,
      last_updated: stock.last_updated,
      created_at: stock.created_at,
      updated_at: stock.updated_at,
      product: stock.product,
      is_low_stock: stock.is_low_stock
    }));

    res.json(formattedStocks);
  } catch (e) {
    console.error('Error fetching stocks:', e);
    next(e);
  }
};

const getStockById = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Utiliser MongoDB pour la lecture
    const stock = await readService.getStockById(id);

    if (stock) {
      // Formater la réponse
      const formattedStock = {
        id: stock._id,
        product_id: stock.product_id,
        quantity: stock.quantity,
        alert_threshold: stock.alert_threshold,
        location: stock.location,
        last_updated: stock.last_updated,
        created_at: stock.created_at,
        updated_at: stock.updated_at,
        product: stock.product,
        is_low_stock: stock.is_low_stock
      };
      
      res.json(formattedStock);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching stock by ID:', e);
    next(e);
  }
};

const createStock = async (req, res, next) => {
  try {
    const { error } = stockSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Utiliser PostgreSQL pour l'écriture
    const stock = await Stock.create(req.body);
    
    // Synchroniser vers MongoDB
    await denormalizationService.syncProduct(stock.product_id);
    
    res.status(201).json(stock);
  } catch (e) {
    console.error('Error creating stock:', e);
    next(e);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const { error } = stockSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const stock = await Stock.findByPk(req.params.id);

    if (stock) {
      await stock.update(req.body);
      
      // Synchroniser vers MongoDB
      await denormalizationService.syncProduct(stock.product_id);
      
      res.json(stock);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating stock:', e);
    next(e);
  }
};

const deleteStock = async (req, res, next) => {
  try {
    const stock = await Stock.findByPk(req.params.id);
    
    if (!stock) {
      return res.sendStatus(404);
    }

    const nbDeleted = await Stock.destroy({
      where: {
        id: req.params.id,
      },
    });
    
    if (nbDeleted === 1) {
      // Supprimer de MongoDB aussi
      const mongoDb = require('../mongo');
      await mongoDb.Stock.findByIdAndDelete(req.params.id);
      
      // Synchroniser le produit
      await denormalizationService.syncProduct(stock.product_id);
      
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error deleting stock:', e);
    next(e);
  }
};

// Méthodes spécialisées pour le store keeper
const getAllStocksForStoreKeeper = async (req, res, next) => {
  try {
    // Utiliser MongoDB pour les lectures
    const filters = {
      limit: parseInt(req.query.limit) || 100,
      offset: parseInt(req.query.offset) || 0,
      low_stock: true
    };

    const stocks = await readService.getAllStocks(filters);
    
    // Formater la réponse pour le store keeper
    const formattedStocks = stocks.map(stock => ({
      id: stock._id,
      product_id: stock.product_id,
      quantity: stock.quantity,
      alert_threshold: stock.alert_threshold,
      location: stock.location,
      last_updated: stock.last_updated,
      product: stock.product,
      is_low_stock: stock.is_low_stock,
      needs_restock: stock.quantity <= stock.alert_threshold
    }));

    res.json(formattedStocks);
  } catch (e) {
    console.error('Error fetching stocks for store keeper:', e);
    next(e);
  }
};

const getStockByIdForStoreKeeper = async (req, res, next) => {
  try {
    const productId = req.params.product_id;
    
    // Utiliser MongoDB pour la lecture
    const stock = await readService.getStockByProductId(productId);

    if (stock) {
      // Formater la réponse pour le store keeper
      const formattedStock = {
        id: stock._id,
        product_id: stock.product_id,
        quantity: stock.quantity,
        alert_threshold: stock.alert_threshold,
        location: stock.location,
        last_updated: stock.last_updated,
        product: stock.product,
        is_low_stock: stock.is_low_stock,
        needs_restock: stock.quantity <= stock.alert_threshold
      };
      
      res.json(formattedStock);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching stock for store keeper:', e);
    next(e);
  }
};

const getStockByDay = async (req, res, next) => {
  try {
    const productId = req.params.product_id;
    
    // Utiliser MongoDB pour les agrégations
    const stockHistory = await readService.getStockHistoryByProduct(productId);
    
    res.json(stockHistory);
  } catch (e) {
    console.error('Error fetching stock history:', e);
    next(e);
  }
};

module.exports = {
  getAllStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
  getAllStocksForStoreKeeper,
  getStockByIdForStoreKeeper,
  getStockByDay
};
