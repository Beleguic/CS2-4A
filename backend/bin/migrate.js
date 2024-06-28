const { sequelize } = require("../models");

const runMigration = async () => {
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

runMigration();
