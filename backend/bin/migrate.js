require('dotenv').config();
const { Client } = require('pg');
const mongoose = require('mongoose');
const { sequelize } = require("../models");

// Importation des modèles MongoDB
const Product = require('../mongo/models/Product');
const User = require('../mongo/models/User');
const Alert = require('../mongo/models/Alert');
const Category = require('../mongo/models/Category');
const AlertType = require('../mongo/models/AlertType');
const ProductPromotion = require('../mongo/models/ProductPromotion');
const PromotionCode = require('../mongo/models/PromotionCode');
const Stock = require('../mongo/models/Stock');
const Newsletter = require('../mongo/models/Newsletter');
const CategoryProduct = require('../mongo/models/CategoryProduct');

// Configuration PostgreSQL
const pgClient = new Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

const runPostgresMigration = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync({ alter: true });
    console.log("Database synced");
  } catch (err) {
    console.error("Error syncing database:", err.message);
    console.error("Stack Trace:", err.stack);
    if (err.errors) {
      err.errors.forEach((error) => {
        console.error("Error Details:", error.message);
      });
    }
  } finally {
    try {
      await sequelize.close();
      console.log("Database connection closed");
    } catch (closeErr) {
      console.error("Error closing database connection:", closeErr.message);
      console.error("Stack Trace:", closeErr.stack);
    }
  }
};

const migrateTableToMongo = async (pgClient, mongoModel, tableName, idField) => {
  try {
    const res = await pgClient.query(`SELECT * FROM ${tableName}`);

    for (const row of res.rows) {
      const document = { ...row };

      if (tableName !== 'users') {
        // Convertir l'UUID en ObjectId pour MongoDB
        document._id = new mongoose.Types.ObjectId(document[idField].replace(/-/g, ''));
        delete document[idField];

        if (!document._id) {
          console.error(`Skipping document with null ${idField} in table ${tableName}`);
          continue;
        }

        // Gestion des duplications spécifiques
        if (tableName === 'products') {
          // Supprimez les produits en double par nom
          const existingProduct = await mongoModel.findOne({ name: document.name });
          if (existingProduct) {
            console.error(`Skipping duplicate product with name: ${document.name}`);
            continue;
          }
        }

        if (tableName === 'alerts') {
          // Convertir les champs UUID en ObjectId pour MongoDB
          if (document.alert_type_id) {
            try {
              document.alert_type_id = new mongoose.Types.ObjectId(document.alert_type_id.replace(/-/g, ''));
            } catch (err) {
              console.error(`Skipping alert with invalid alert_type_id: ${document.alert_type_id}`);
              continue;
            }
          }
        }

        if (tableName === 'stocks' && document.product_id) {
          // Convertir product_id en ObjectId
          try {
            document.product_id = new mongoose.Types.ObjectId(document.product_id.replace(/-/g, ''));
          } catch (err) {
            console.error(`Skipping stock with invalid product_id: ${document.product_id}`);
            continue;
          }
        }
      } else {
        // Exclure la conversion pour le modèle User, utiliser l'UUID comme chaîne de caractères
        document._id = document[idField];
        delete document[idField];
      }

      try {
        await mongoModel.updateOne({ _id: document._id }, document, { upsert: true });
      } catch (err) {
        console.error(`Error upserting document in table ${tableName}:`, err.message);
      }
    }

    console.log(`Data migration for table ${tableName} to MongoDB complete`);
  } catch (err) {
    console.error(`Error during migration of table ${tableName}:`, err.message);
  }
};


const migrateAllTablesToMongo = async () => {
  try {
    await pgClient.connect();
    console.log('Connected to PostgreSQL for migration');

    await migrateTableToMongo(pgClient, Product, 'products', 'id');
    await migrateTableToMongo(pgClient, User, 'users', 'id');
    await migrateTableToMongo(pgClient, Alert, 'alerts', 'id');
    await migrateTableToMongo(pgClient, Category, 'categories', 'id');
    await migrateTableToMongo(pgClient, AlertType, 'alert_types', 'id');
    await migrateTableToMongo(pgClient, ProductPromotion, 'product_promotions', 'id');
    await migrateTableToMongo(pgClient, PromotionCode, 'promotion_codes', 'id');
    await migrateTableToMongo(pgClient, Stock, 'stocks', 'id');

    // Vérifiez si la table category_products existe avant de migrer
    try {
      const res = await pgClient.query(`SELECT * FROM category_products LIMIT 1`);
      await migrateTableToMongo(pgClient, CategoryProduct, 'category_products', 'id');
    } catch (err) {
      console.error(`Error during migration of table category_products: ${err.message}`);
    }

    await migrateTableToMongo(pgClient, Newsletter, 'newsletters', 'id');

  } finally {
    try {
      await pgClient.end();
      console.log("PostgreSQL connection closed");
    } catch (closeErr) {
      console.error("Error closing PostgreSQL connection:", closeErr.message);
    }
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
    } catch (closeErr) {
      console.error("Error closing MongoDB connection:", closeErr.message);
    }
  }
};

runPostgresMigration().then(() => {
  mongoose.connect(process.env.MONGO_URL)
    .then(migrateAllTablesToMongo)
    .catch(err => console.error('Error connecting to MongoDB:', err.message));
});
