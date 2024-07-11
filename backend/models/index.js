const fs = require("node:fs");
const path = require("node:path");
const sequelize = require("./db");

const files = fs.readdirSync(__dirname);
const db = {
  sequelize,
};

for (const file of files) {
  if (["index.js", "db.js"].includes(file)) continue;
  const model = require(path.join(__dirname, file))(sequelize);
  db[model.name] = model;
}

// Configurer les associations des modèles
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = require('sequelize');

// Méthodes pour synchroniser et fermer la base de données
db.syncDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

db.closeDB = async () => {
  try {
    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
};

module.exports = db;
