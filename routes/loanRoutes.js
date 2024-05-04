const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');

// Define routes for loan-related operations
router.post('/create-loan', loanController.createLoan);
router.get('/view-loan/:loan_id', loanController.viewLoan);
router.post('/make-payment/:Customer_ID/:Loan_ID', loanController.makePayment);
router.get('/view-statement/:Customer_ID/:Loan_ID', loanController.viewStatement);

module.exports = router;