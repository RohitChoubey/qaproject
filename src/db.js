require('dotenv').config(); // Load environment variables from .env file

const mysql = require('mysql2');

// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT || 3306 // Optional, in case you specify a different port in .env
// });
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root@123',
  database: 'quality_assurance_db',
  port: 3306 // Optional, in case you specify a different port in .env
});
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

module.exports = db;
