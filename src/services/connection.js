const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  database: "todo-app",
  user: "root",
  password: "",
});

module.exports = { connection };
