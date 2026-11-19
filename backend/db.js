const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Check the database connection when the server starts.
pool.query('SELECT NOW()')
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.log("Database connection failed:", error.message));

module.exports = pool;
