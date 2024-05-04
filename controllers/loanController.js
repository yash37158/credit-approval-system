const { Loan } = require('../models/Loan');
const { Customer } = require('../models/Customer'); 
const { calculateCreditScore } = require('./customerController');

// Define controller functions

exports.processLoan = async (req, res) => {
  try {
    const { customer_id, loan_amount, interest_rate, tenure } = req.body;
    const customer = await Customer.findByPk(customer_id);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const loanEligible = await checkLoanEligibility(customer, loan_amount, interest_rate);

    if (!loanEligible) {
      return res.status(400).json({ loan_approved: false, message: 'Loan not approved' });
    }
    const monthly_installment = calculateMonthlyInstallment(loan_amount, interest_rate, tenure);

    const loan = await Loan.create({
      customer_id,
      loan_amount,
      interest_rate,
      tenure,
      monthly_installment,

    });

    res.status(201).json({
      loan_id: loan.id,
      customer_id: loan.customer_id,
      loan_approved: true,
      message: 'Loan approved',
      monthly_installment,
    });
  } catch (error) {
    console.error('Error processing loan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



exports.createLoan = async (req, res) => {
  try {
    const { Customer_ID, Loan_Amount, Interest_Rate, Tenure } = req.body;
    const isEligible = await checkLoanEligibility(Customer_ID, Loan_Amount);

    if (!isEligible) {
      return res.status(400).json({
        Loan_ID: null,
        Customer_ID,
        loan_approved: false,
        message: 'Loan not approved due to eligibility',
        Monthly_Payment: null
      });
    }
    const monthly_installment = calculateMonthlyInstallment(Loan_Amount, Interest_Rate, Tenure);
    const loan = await Loan.create({
      Customer_Id: Customer_ID,
      Loan_Amount: Loan_Amount,
      Interest_Rate: Interest_Rate,
      Tenure: Tenure,
      Monthly_Payment,
    });

    res.status(201).json({
      Loan_ID: Loan.ID,
      Customer_ID,
      Loan_Approved: true,
      message: 'Loan approved',
      monthly_installment
    });
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.viewLoan = async (req, res) => {
  try {

    const { loan_id } = req.params;
    const loan = await Loan.findOne({
      where: {
        Loan_ID: loan_id
      }
    });

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const customer = await Loan.findByPk(loan.Customer_ID);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.status(200).json({
      loan_id: loan.Loan_ID,
      customer: {
        id: customer.id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone_number: customer.phone_number,
        age: customer.age,
      },
      loan_amount: loan.Loan_Amount,
      interest_rate: loan.Interest_Rate,
      monthly_installment: loan.Monthly_Payment,
      tenure: loan.Tenure,
    });
  } catch (error) {
    console.error('Error fetching loan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.makePayment = async (req, res) => {
  try {
    const Customer_ID = req.params.Customer_ID;
    const Loan_ID = req.params.Loan_ID;
    const paymentAmount = parseFloat(req.body.payment_amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    if (!Loan_ID) {
      return res.status(400).json({ error: 'Loan_ID is required' });
    }

    const loan = await Loan.findOne({
      where: {
        Loan_ID: Loan_ID
      }
    });

    if (!loan || loan.Customer_ID !== parseInt(Customer_ID)) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    if (paymentAmount < loan.Monthly_Payment) {
      return res.status(400).json({ error: 'Payment amount is less than due installment' });
    }

    const remainingPrincipal = loan.Loan_Amount - paymentAmount;
    const monthlyInterestRate = loan.Interest_Rate / 100 / 12;
    const remainingTenure = calculateRemainingRepayments(loan);
    const newEMIAmount = (remainingPrincipal * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -remainingTenure));
    console.log(`Due amount: ${newEMIAmount}`);
    loan.monthly_installment = newEMIAmount;
    loan.repayments_left--;  

    await loan.save();

    res.status(200).json({ message: 'Payment successful' });
  } catch (error) {
    console.error('Error making payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.viewStatement = async (req, res) => {
  try {
    const { Customer_ID, Loan_ID } = req.params;

    const loan = await Loan.findOne({
      where: {
        Loan_ID: Loan_ID
      }
    });

    if (!loan || loan.Customer_ID !== parseInt(Customer_ID)) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    const loanStatement = {
      Customer_ID: loan.Customer_ID,
      Loan_ID: loan.id,
      principal: loan.Loan_Amount,
      interest_rate: loan.Interest_Rate,
      Amount_paid: loan.Amount_paid,
      monthly_installment: loan.monthly_installment,
      repayments_left: loan.repayments_left,
    };

    res.status(200).json(loanStatement);
  } catch (error) {
    console.error('Error fetching loan statement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


function calculateMonthlyInstallment(Loan_Amount, Interest_Rate, Tenure) {
  const monthly_interest_rate = (Interest_Rate / 100) / 12;
  const monthly_installment = Loan_Amount * monthly_interest_rate * Math.pow(1 + monthly_interest_rate, Tenure) / (Math.pow(1 + monthly_interest_rate, Tenure) - 1);
  return monthly_installment;
}

async function calculateCurrentEmis(Customer_ID) {
  const activeLoans = await Loan.findAll({
    where: {
      Customer_Id: Customer_ID,
      status: 'active'
    }
  });

  const totalEmis = activeLoans.reduce((sum, loan) => sum + loan.Monthly_Payment, 0);

  return totalEmis;
}

// Function to check loan eligibility based on customer's credit score and other criteria
async function checkLoanEligibility(Customer_ID, Loan_Amount, Interest_Rate) {
  const customerData = await Customer.findByPk(Customer_ID);
  if (!customerData) {
    return false;
  }

  const creditScore = await calculateCreditScore(Customer_ID);

  if (Loan_Amount > creditScore * 10) {
    return false;
  }

  const currentEmis = await calculateCurrentEmis(Customer_ID);
  if (currentEmis > (customerData.monthly_income / 2)) {
    return false;
  }

  return true;
}

function calculateRemainingRepayments(loan) {
  const totalEMIs = loan.Loan_Amount / loan.Monthly_Payment;

  const remainingRepayments = totalEMIs - loan.EMIs_paid_on_Time;

  return Math.ceil(remainingRepayments);
}

