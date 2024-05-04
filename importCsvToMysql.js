const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql');

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '@1Yashashi',
  database: 'ecommerce_db'
});

// Connect to MySQL
connection.connect();

// Read the CSV file and insert data into MySQL database
fs.createReadStream('loan_data.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Convert Date_of_Approval to correct format (YYYY-MM-DD)
    const dateOfApproval = formatDate(row.Date_of_Approval);
    row.Date_of_Approval = dateOfApproval;

    // Convert End_Date to correct format (YYYY-MM-DD)
    const endDate = formatDate(row.End_Date);
    row.End_Date = endDate;

    // Explicitly specify the Customer_ID value
    const customerId = parseInt(row.Customer_ID); // Assuming Customer_ID is a number
    row.Customer_ID = customerId;

    // Insert data into MySQL table
    connection.query('INSERT IGNORE INTO loan_details SET ?', row, (error, results, fields) => {
      if (error) throw error;
      console.log('Inserted row:', results);
    });
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
    // Close MySQL connection
    connection.end();
  });

// Function to format date into YYYY-MM-DD
function formatDate(dateString) {
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
}
