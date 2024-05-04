# credit-approval-system
Overview
This project is a Credit Approval System built using NodeJS with Express web framework, designed to handle customer registration, loan eligibility checks, loan processing, and repayment management.

## Setup and Initialization
### Setup: 
Utilizes NodeJS with Express framework, Docker for containerization, and MySQL/PostgreSQL for data persistence.
### Initialization: 
Ingests provided customer and loan data from Excel files using Javascript file.

## API Endpoints
* /register: Add a new customer to the system with an approved credit limit based on salary.
* /check-eligibility: Check loan eligibility based on credit score and historical loan data.
* /create-loan: Process a new loan based on eligibility criteria.
* /view-loan/loan_id: View loan details and customer information.
* /make-payment/customer_id/loan_id: Make a payment towards an EMI.
* /view-statement/customer_id/loan_id: View statement of a particular loan.

