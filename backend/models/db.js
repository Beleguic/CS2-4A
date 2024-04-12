const { Sequelize } = require('sequelize');

// Récupération de l'URL de la base de données à partir des variables d'environnement
const databaseUrl = process.env.DATABASE_URL;

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres', // Spécifiez le dialecte de base de données
});

sequelize.authenticate()
  .then(() => console.log('Connection to the database has been established successfully.'))
  .catch(err => console.error('Unable to connect to the database:', err));

module.exports = sequelize;
