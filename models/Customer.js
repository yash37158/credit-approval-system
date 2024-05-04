const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('./sequelize');

const Customer = sequelize.define('Customer', {
  customer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
    
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  monthly_salary: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  approved_limit: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  current_debt: {
    type: DataTypes.FLOAT,
    allowNull: true
  }
}, {
    timestamps: true
  });

module.exports = {
  Customer,
  sequelize,
}