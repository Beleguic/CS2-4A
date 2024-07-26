const CategoryProduct = require('../mongo/models/CategoryProduct');
const Category = require('../mongo/models/Category');
const Product = require('../mongo/models/Product');
const Joi = require('joi');

// Schéma de validation de `CategoryProduct`
const categoryProductSchema = Joi.object({
  category_id: Joi.string().required(),
  product_id: Joi.string().required(),
});

const getAllCategoryProducts = async (req, res, next) => {
  try {
    const categoryProducts = await CategoryProduct.find()
      .populate({ path: 'category_id', select: 'id name' })
      .populate({ path: 'product_id', select: 'id name' });
    res.json(categoryProducts);
  } catch (e) {
    console.error('Error fetching category products:', e);
    next(e);
  }
};

const getCategoryProductById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const categoryProduct = await CategoryProduct.findById(id)
      .populate({ path: 'category_id', select: 'id name' })
      .populate({ path: 'product_id', select: 'id name' });

    if (categoryProduct) {
      res.json(categoryProduct);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching category product by ID:', e);
    next(e);
  }
};

const createCategoryProduct = async (req, res, next) => {
  const pgClient = new Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
  await pgClient.connect();

  const mongoSession = await startMongoSession();

  try {
    // Démarrer une transaction PostgreSQL
    await pgClient.query('BEGIN');

    const { category_id, product_id } = req.body;
    const categoryProductSchema = Joi.object({
      category_id: Joi.string().required(),
      product_id: Joi.string().required(),
    });

    const { error } = categoryProductSchema.validate(req.body);
    if (error) {
      throw new Error(error.details[0].message);
    }

    // Insérer dans PostgreSQL
    const insertCategoryProductQuery = `
      INSERT INTO category_product (category_id, product_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await pgClient.query(insertCategoryProductQuery, [category_id, product_id]);
    const newCategoryProduct = result.rows[0];

    // Insérer dans MongoDB
    const mongoCategoryProduct = new CategoryProduct({
      category_id: newCategoryProduct.category_id,
      product_id: newCategoryProduct.product_id,
    });
    await mongoCategoryProduct.save({ session: mongoSession });

    // Commit transactions
    await commitTransaction(pgClient, mongoSession);

    res.status(201).json(newCategoryProduct);
  } catch (e) {
    console.error('Error creating category product:', e);
    await rollbackTransaction(pgClient, mongoSession);
    res.status(500).json({ error: e.message });
  } finally {
    await pgClient.end();
  }
};


const updateCategoryProduct = async (req, res, next) => {
  const pgClient = new Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
  await pgClient.connect();

  const mongoSession = await startMongoSession();

  try {
    await pgClient.query('BEGIN');

    const { id } = req.params;
    const { category_id, product_id } = req.body;

    const categoryProductSchema = Joi.object({
      category_id: Joi.string().required(),
      product_id: Joi.string().required(),
    });

    const { error } = categoryProductSchema.validate(req.body);
    if (error) {
      throw new Error(error.details[0].message);
    }

    // Mise à jour dans PostgreSQL
    const updateCategoryProductQuery = `
      UPDATE category_product
      SET category_id = $1, product_id = $2
      WHERE id = $3
      RETURNING *;
    `;
    const result = await pgClient.query(updateCategoryProductQuery, [category_id, product_id, id]);
    const updatedCategoryProduct = result.rows[0];

    if (!updatedCategoryProduct) {
      throw new Error('Category product not found');
    }

    // Mise à jour dans MongoDB
    await CategoryProduct.updateOne(
      { _id: id },
      { category_id: updatedCategoryProduct.category_id, product_id: updatedCategoryProduct.product_id },
      { session: mongoSession }
    );

    await commitTransaction(pgClient, mongoSession);

    res.status(200).json(updatedCategoryProduct);
  } catch (e) {
    console.error('Error updating category product:', e);
    await rollbackTransaction(pgClient, mongoSession);
    res.status(500).json({ error: e.message });
  } finally {
    await pgClient.end();
  }
};

const deleteCategoryProduct = async (req, res, next) => {
  const pgClient = new Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
  await pgClient.connect();

  const mongoSession = await startMongoSession();

  try {
    await pgClient.query('BEGIN');

    const { id } = req.params;

    // Suppression dans PostgreSQL
    const deleteCategoryProductQuery = `
      DELETE FROM category_product
      WHERE id = $1
      RETURNING *;
    `;
    const result = await pgClient.query(deleteCategoryProductQuery, [id]);
    const deletedCategoryProduct = result.rows[0];

    if (!deletedCategoryProduct) {
      throw new Error('Category product not found');
    }

    // Suppression dans MongoDB
    await CategoryProduct.deleteOne({ _id: id }, { session: mongoSession });

    await commitTransaction(pgClient, mongoSession);

    res.sendStatus(204);
  } catch (e) {
    console.error('Error deleting category product:', e);
    await rollbackTransaction(pgClient, mongoSession);
    res.status(500).json({ error: e.message });
  } finally {
    await pgClient.end();
  }
};


module.exports = {
  getAllCategoryProducts,
  getCategoryProductById,
  createCategoryProduct,
  updateCategoryProduct,
  deleteCategoryProduct,
};
