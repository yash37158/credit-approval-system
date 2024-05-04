const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// Define routes for customer-related operations
router.post('/register', customerController.registerCustomer);
router.post('/check-eligibility', customerController.checkEligibility);

module.exports = router;