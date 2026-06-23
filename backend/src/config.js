require("dotenv").config();

const config = {
  port: Number(process.env.PORT || process.env.BACKEND_PORT || 3000),
  database: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE || "asistencia_escolar",
    user: process.env.DB_USER || process.env.MYSQL_USER || "asistencia_user",
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "asistencia_pass"
  }
};

module.exports = { config };
