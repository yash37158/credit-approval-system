// config/sequelize.js
require('dotenv').config(); // Load environment variables from .env file
const Sequelize = require('sequelize');


// Define database connection parameters
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
});

sequelize.authenticate()
  .then(() => console.log('Database connection has been established successfully.'))
  .catch(error => console.error('Unable to connect to the database:', error));

async function initializeDatabase() {
  try {
    await sequelize.sync();
    console.log('Customer model synced with database');
  } catch (err) {
    console.error('Error syncing Customer model:', err);
  }
}

initializeDatabase();

module.exports = sequelize;
