const { Stock, Product } = require('../models');
const Joi = require('joi');

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
    next(e);
  }
};

module.exports = {
  getAllStocks,
  getStockById,
  createStock,
  updateStock,
  deleteStock,
};
