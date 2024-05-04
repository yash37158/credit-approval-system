const { Customer } = require('../models/Customer');
const { Op } = require('sequelize');
const { Loan } = require('../models/Loan');

exports.registerCustomer = async (req, res) => {
  try {
    const { first_name, last_name, age, phone_number, monthly_salary } = req.body;

    const approved_limit = Math.round(36 * monthly_salary / 100000) * 100000; // Round to nearest lakh

    const customer = await Customer.create({
      first_name,
      last_name,
      age,
      phone_number,
      monthly_salary,
      approved_limit
    });

    res.status(201).json({
      customer_id: customer.id,
      name: `${customer.first_name} ${customer.last_name}`,
      age: customer.age,
      monthly_salary: customer.monthly_salary,
      approved_limit: customer.approved_limit,
      phone_number: customer.phone_number,
    });
  } catch (error) {
    console.error('Error registering customer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.checkEligibility = async (req, res) => {
  try {
    const { Customer_ID, Requested_Loan_Amount, Interest_Rate, Tenure } = req.body;

    const customer = await Loan.findByPk(Customer_ID);
    console.log('customer:', customer);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate credit score based on historical loan data
    const creditScore = await this.calculateCreditScore(Customer_ID);

    // Initialize approval status and corrected interest rate
    let approved = false;
    let corrected_interest_rate = Interest_Rate;

    // Determine loan approval based on credit score
    if (creditScore > 50) {
      approved = true;
    } else if (creditScore > 30 && Interest_Rate > 12) {
      approved = true;
      corrected_interest_rate = Math.max(12, Interest_Rate);
    } else if (creditScore > 10 && Interest_Rate > 16) {
      approved = true;
      corrected_interest_rate = Math.max(16, Interest_Rate); 
    }

    // Check if sum of all current EMIs > 50% of monthly salary
    if (customer.current_emis > (customer.monthly_income / 2)) {
      approved = false;
    }

    let monthly_installment = 0;
    let corrected_tenure = Tenure;
      // Calculate the monthly installment based on the corrected interest rate and tenure
    if (approved) {
      const r = corrected_interest_rate / 100 / 12;
      const n = corrected_tenure * 12; // Convert tenure to months
      monthly_installment = (r * Requested_Loan_Amount) / (1 - Math.pow(1 + r, -n));
    }

    // Respond with eligibility status, corrected interest rate, and other details
    res.json({
      customer_id: Customer_ID,
      approved,
      interest_rate: approved ? Interest_Rate : null,
      corrected_interest_rate:  approved ? corrected_interest_rate : null,
      tenure:  approved ? corrected_tenure : null,
      monthly_installment: approved ? monthly_installment : null
    });
  } catch (error) {
    console.error('Error checking eligibility:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.calculateCreditScore = async (Customer_ID) => {
  try {
    // Fetch historical loan data of the customer from the database
    const pastLoans = await Loan.findAll({
      where: {
        Customer_Id: Customer_ID,
      }
    });

    let creditScore = 0;

    // Component 1: Past loans paid on time
    const pastLoansPaidOnTime = pastLoans.filter(Loan => Loan.EMIs_paid_on_Time > 0).length;
    creditScore += pastLoansPaidOnTime * 10;

    // Component 2: Number of loans taken in the past
    const numberOfLoansTaken = pastLoans.length;
    creditScore += numberOfLoansTaken * 5;

    // Component 3: Loan approved volume
    const totalLoanAmountApproved = pastLoans.reduce((acc, Loan) => acc + Loan.Loan_Amount, 0);
    creditScore += (totalLoanAmountApproved / 100000); // Add 1 credit point

    // Component 4: Monthly repayments done
    const totalMonthlyRepaymentsDone = pastLoans.reduce((acc, Loan) => acc + Loan.Monthly_Payment * Loan.EMIs_paid_on_Time, 0);
    creditScore += (totalMonthlyRepaymentsDone / 10000); // Add 1 credit point for every 10k of monthly repayments done

    // Component 5: Interest rate
    const averageInterestRate = numberOfLoansTaken > 0 ? pastLoans.reduce((acc, Loan) => acc + Loan.Interest_Rate, 0) / numberOfLoansTaken : 0;
    creditScore -= averageInterestRate; // Deduct 1 credit point
    creditScore = Math.round(creditScore);
    return creditScore;
  } catch (error) {
    console.error('Error calculating credit score:', error);
  }
};
