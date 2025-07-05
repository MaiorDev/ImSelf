const mysql = require("mysql");

export const connection = mysql.createConnection({
  host: "localhost",
  database: "todo-app",
  user: "root",
  password: "",
});
