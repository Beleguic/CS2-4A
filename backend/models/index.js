const fs = require("fs");
const path = require("path");
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

module.exports = db;
