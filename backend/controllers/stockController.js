const { Stock, Product, sequelize} = require('../models');
const Joi = require('joi');
const {Op} = require("sequelize");

const stockSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
  product_id: Joi.string().uuid().required(),
  stock: Joi.number().integer(),
  status: Joi.string().required(),
  difference: Joi.string().required(),
});

const filterStockFields = (stock) => {
  const { product, created_at, ...filteredStock } = stock;
  return filteredStock;
};

const getAllStocks = async (req, res, next) => {
  try {
    const { product_id } = req.query;

    const queryOptions = {
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
      order: [['created_at', 'ASC']],
    };

    if (product_id) {
      queryOptions.where = { product_id };
    }

    const stocks = await Stock.findAll(queryOptions);

    if (!stocks) {
      return res.sendStatus(404);
    } else {
      return res.status(200).json(stocks);
    }
  } catch (e) {
    return res.sendStatus(500);
  }
};

const getAllStocksForStoreKeeper = async (req, res, next) => {
  try {
    const { product_id } = req.query;

    const latestStocksSubQuery = await Stock.findAll({
      attributes: [
        [sequelize.fn('MAX', sequelize.col('created_at')), 'latest_created_at'],
        'product_id',
      ],
      group: 'product_id',
      raw: true,
    });

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
      return res.status(404);
    } else {
      return res.status(200).json(stocks);
    }
  } catch (e) {
    return res.sendStatus(500);
  }
};

const getStockById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const stock = await Stock.findByPk(id, {
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }]
    });

    if (stock) {
      return res.status(200).json(stock);
    } else {
      return res.sendStatus(404);
    }
  } catch (e) {
    return res.sendStatus(500);
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
    return res.status(201).json(stock);
  } catch (e) {
    return res.sendStatus(500);
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

    if (!stock) {
      return res.sendStatus(404);
    }

    await stock.update(filteredBody);
    return res.status(200).json(stock);
  } catch (e) {
    return res.sendStatus(500);
  }
};

const deleteStock = async (req, res, next) => {
  try {
    const nbDeleted = await Stock.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (nbDeleted !== 1) {
      return res.sendStatus(404);
    }

    return res.status(204);
  } catch (e) {
    return res.sendStatus(500);
  }
};

const getStockByIdForStoreKeeper = async (req, res, next) => {
  try {
    const productId = req.params.product_id;
    const stock = await Stock.findAll({
      where: { product_id: productId },
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']]
    });

    if (stock.length > 0) {
      return res.status(200).json(stock);
    } else {
      return res.sendStatus(404);
    }
  } catch (e) {
    return res.sendStatus(500);
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
      return res.status(200).json(stock);
    } else {
      return res.sendStatus(404);
    }
  } catch (e) {
    return res.sendStatus(500);
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
