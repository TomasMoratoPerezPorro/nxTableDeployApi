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

/* module.exports = pool; */

const mysqlConnection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  port: 3306,
  dateStrings: true,
  multipleStatements: true,
});

mysqlConnection.connect(function (err) {
  if (err) {
    console.log(err);
    return;
  } else {
    console.log("Db is connected");
  }
});

module.exports.mysqlConnection = mysqlConnection;
module.exports.pool = pool;

/* module.exports = mysqlConnection; */
