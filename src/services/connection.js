import mysql from "mysql";

export const connection = mysql.createConnection({
  host: "localhost",
  database: "todo-app",
  user: "root",
  password: "",
});
