const mysql = require("mysql2/promise");
const { config } = require("./config");

const pool = mysql.createPool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function pingDatabase() {
  const [rows] = await pool.execute("SELECT 1 AS ok");
  return rows[0].ok === 1 ? "ok" : "error";
}

module.exports = {
  pool,
  pingDatabase
};
