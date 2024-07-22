const { Stock, Product, sequelize} = require('../models');
const Joi = require('joi');
const {Op} = require("sequelize");

// Stock schema validation
const stockSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
  product_id: Joi.string().uuid().required(),
  stock: Joi.number().integer(),
  status: Joi.string().required(),
  difference: Joi.string().required(),
});

// Filtrer les champs non autorisés
const filterStockFields = (stock) => {
  const { product, created_at, ...filteredStock } = stock;
  return filteredStock;
};

const getAllStocks = async (req, res, next) => {
  try {
    const { product_id } = req.query;

    const queryOptions = {
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
      order: [['created_at', 'ASC']], // Ajoutez cette ligne pour trier par created_at asc
    };

    if (product_id) {
      queryOptions.where = { product_id };
    }

    const stocks = await Stock.findAll(queryOptions);

    if (!stocks) {
      return res.status(404).json({ message: 'Stocks not found' });
    } else {
      return res.json(stocks);
    }
  } catch (e) {
    console.error('Error fetching stocks:', e);
    next(e);
  }
};

const getAllStocksForStoreKeeper = async (req, res, next) => {
  try {
    const { product_id } = req.query;

    // Sous-requête pour obtenir le dernier created_at pour chaque product_id
    const latestStocksSubQuery = await Stock.findAll({
      attributes: [
        [sequelize.fn('MAX', sequelize.col('created_at')), 'latest_created_at'],
        'product_id',
      ],
      group: 'product_id',
      raw: true,
    });

    // Construire un tableau des conditions pour la requête principale
    const latestConditions = latestStocksSubQuery.map(stock => {
      return {
        product_id: stock.product_id,
        created_at: stock.latest_created_at,
      };
    });

    const queryOptions = {
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
      order: [['product_id', 'ASC'], ['created_at', 'DESC']],
      where: {
        [Op.or]: latestConditions,
      },
    };

    if (product_id) {
      queryOptions.where.product_id = product_id;
    }

    const stocks = await Stock.findAll(queryOptions);

    if (!stocks || stocks.length === 0) {
      return res.status(404).json({ message: 'Stocks not found' });
    } else {
      return res.json(stocks);
    }
  } catch (e) {
    console.error('Error fetching stocks:', e);
    next(e);
  }
};

const getStockById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const stock = await Stock.findByPk(id, {
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }]
    });

    if (stock) {
      res.json(stock);
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
    const filteredBody = filterStockFields(req.body);
    const { error } = stockSchema.validate(filteredBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const stock = await Stock.create(filteredBody);
    res.status(201).json(stock);
  } catch (e) {
    console.error('Error creating stock:', e);
    next(e);
  }
};

const updateStock = async (req, res, next) => {
  try {
    const filteredBody = filterStockFields(req.body);
    const { error } = stockSchema.validate(filteredBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const stock = await Stock.findByPk(req.params.id);

    if (stock) {
      await stock.update(filteredBody);
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
    const nbDeleted = await Stock.destroy({
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
    console.error('Error deleting stock:', e);
    next(e);
  }
};

const getStockByIdForStoreKeeper = async (req, res, next) => {
  console.log('getStockByIdForStoreKeeper');
  try {
    const productId = req.params.product_id;
    const stock = await Stock.findAll({
      where: { product_id: productId },
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });

    if (stock.length > 0) {
      res.json(stock);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching stock by ID:', e);
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
};
