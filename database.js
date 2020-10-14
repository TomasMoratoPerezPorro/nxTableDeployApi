require("dotenv").config();
const mysql = require("mysql");

var pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  port: 3306,
  dateStrings: true,
  multipleStatements: true,
});


module.exports.pool = pool;

/* const mysqlConnection = mysql.createConnection({
  host: "localhost",
  user:"root",
  password:"password",
  database:"restaurant",
  dateStrings: true,
  multipleStatements:true
}); */
