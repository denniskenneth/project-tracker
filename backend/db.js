const { Sequelize } = require("sequelize");
require("dotenv").config({ quiet: true });

const dbName =
  process.env.NODE_ENV === "test"
    ? process.env.DB_NAME_TEST
    : process.env.DB_NAME;

const sequelize = new Sequelize(
  dbName,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
  }
);

module.exports = sequelize;
