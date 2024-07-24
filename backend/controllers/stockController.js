const { Stock: StockPostgres, sequelize } = require('../models');
const Stock = require('../mongo/models/Stock');
const Product = require('../mongo/models/Product');
const Joi = require('joi');
const { Op } = require("sequelize");

// Stock schema validation
const stockSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
  product_id: Joi.string().required(),
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
      product_id: product_id,
    };

    const stocks = await Stock.find(queryOptions).populate('product_id', 'id name');

    if (!stocks) {
      return res.status(404).json({ message: 'Stocks not found' });
    } else {
      return res.status(200).json(stocks);
    }
  } catch (e) {
    console.error('Error fetching stocks:', e);
    next(e);
  }
};

const getAllStocksForStoreKeeper = async (req, res, next) => {
  try {
    const { product_id } = req.query;

    const latestStocksSubQuery = await Stock.aggregate([
      {
        $group: {
          _id: "$product_id",
          latest_created_at: { $max: "$created_at" }
        }
      }
    ]);

    const latestConditions = latestStocksSubQuery.map(stock => {
      return {
        product_id: stock._id,
        created_at: stock.latest_created_at,
      };
    });

    const queryOptions = {
      $or: latestConditions,
      product_id: product_id,
    };

    const stocks = await Stock.find(queryOptions).populate('product_id', 'id name');

    if (!stocks || stocks.length === 0) {
      return res.status(404).json({ message: 'Stocks not found' });
    } else {
      return res.status(200).json(stocks);
    }
  } catch (e) {
    console.error('Error fetching stocks:', e);
    next(e);
  }
};

const getStockById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const stock = await Stock.findById(id).populate('product_id', 'id name');

    if (stock) {
      res.status(200).json(stock);
    } else {
      res.status(404).json({ message: 'Stock not found' });
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

    const stock = await StockPostgres.create(filteredBody);
    const stockMongo = new Stock(filteredBody);
    await stockMongo.save();

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

    const stock = await StockPostgres.findByPk(req.params.id);

    if (stock) {
      await stock.update(filteredBody);
      await Stock.updateOne({ _id: req.params.id }, filteredBody);
      res.status(200).json(stock);
    } else {
      res.status(404).json({ message: 'Stock not found' });
    }
  } catch (e) {
    console.error('Error updating stock:', e);
    next(e);
  }
};

const deleteStock = async (req, res, next) => {
  try {
    const nbDeleted = await StockPostgres.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (nbDeleted === 1) {
      await Stock.deleteOne({ _id: req.params.id });
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Stock not found' });
    }
  } catch (e) {
    console.error('Error deleting stock:', e);
    next(e);
  }
};

const getStockByIdForStoreKeeper = async (req, res, next) => {
  try {
    const productId = req.params.product_id;
    const stock = await Stock.find({ product_id: productId })
      .populate('product_id', 'id name')
      .sort({ created_at: 'desc' });

    if (stock.length > 0) {
      res.status(200).json(stock);
    } else {
      res.status(404).json({ message: 'Stock not found' });
    }
  } catch (e) {
    console.error('Error fetching stock by ID:', e);
    next(e);
  }
};

const getStockByDay = async (req, res, next) => {
  try {
    const productId = req.params.product_id;

    const query = `
      SELECT 
        DATE(s.created_at) AS date, 
        s.quantity, 
        p.name AS product_name
      FROM 
        stocks s
      INNER JOIN 
        (
          SELECT 
            DATE(created_at) AS date,
            MAX(created_at) AS max_created_at
          FROM 
            stocks
          WHERE 
            product_id = :productId
          GROUP BY 
            DATE(created_at)
        ) subquery 
      ON 
        DATE(s.created_at) = subquery.date
        AND s.created_at = subquery.max_created_at
      INNER JOIN
        products p
      ON
        s.product_id = p.id
      WHERE 
        s.product_id = :productId
      ORDER BY 
        s.created_at ASC;
    `;

    const stock = await sequelize.query(query, {
      replacements: { productId },
      type: sequelize.QueryTypes.SELECT,
    });

    if (stock.length > 0) {
      res.status(200).json(stock);
    } else {
      res.status(404).json({ message: 'Stock not found' });
    }
  } catch (e) {
    console.error('Error fetching stock by day:', e);
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
  getStockByDay,
};
