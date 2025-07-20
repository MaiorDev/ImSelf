const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  database: "todo-app",
  user: "root",
  password: "",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

module.exports = { connection };
