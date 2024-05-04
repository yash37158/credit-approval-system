const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

const Loan = sequelize.define('loan_details', {
  Customer_ID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  Loan_ID: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  Loan_Amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  Tenure: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  Interest_Rate: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  Monthly_Payment: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  EMIs_paid_on_Time: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  Date_of_Approval: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  End_Date: {
    type: DataTypes.DATE,
    allowNull: false,
  },

}, {
  timestamps: false 
});

module.exports =  { 
  Loan,
  sequelize,
}


