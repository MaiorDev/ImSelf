const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  database: "imself",
  user: "root",
  password: "",
});

connection.connect(function (err) {
  if (err) {
    throw err;
  } else {
    console.log("conexion exitosa");
  }
});

module.exports = connection;
