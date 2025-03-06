const express = require("express");
const connection = require("./public/js/db");
const app = express();

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/habitTracker", (req, res) => {
  const consult = "SELECT * FROM habits";
  connection.query(consult, (error, results) => {
    if (error) {
      throw error;
    }
    res.render("habitTracker", { habits: results });
  });
});

app.post("/addHabit", (req, res) => {
  const data = req.body;
  const title = data.title;
  const description = data.description;
  const consult = `INSERT INTO habits (title, description, status) VALUES (?, ?, 'pending')`;
  connection.query(consult, [title, description], (err) => {
    if (err) {
      console.error("Error consult", err.message);
      return res.status(500).send("Error in the registration of the habit");
    }
    res.redirect("/habitTracker");
  });
});
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto: http://localhost:${PORT}`);
});
