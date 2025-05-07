const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true
  }
};

const connectToDatabase = async () => {
  try {
    await sql.connect(config);
    console.log('Connected to Azure SQL Database');
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
};

module.exports = { connectToDatabase, sql };