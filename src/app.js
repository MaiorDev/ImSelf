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

app.get("/projects", (req, res) => {
  res.render("projects.ejs");
});

app.get("/school", (req, res) => {
  res.render("school.ejs");
});

app.get("/objectives", (req, res) => {
  res.render("objectives.ejs");
});

app.get("/notes", (req, res) => {
  res.render("notes.ejs");
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

app.post("/habitTracker/addHabit", (req, res) => {
  const data = req.body;
  const title = data.title;
  const description = data.description;
  const date = new Date();
  const consult = `INSERT INTO habits (title, description, status, date) VALUES (?, ?, 'pending', ?)`;
  connection.query(consult, [title, description, date], (err) => {
    if (err) {
      console.error("Error consult", err.message);
      return res.status(500).send("Error in the registration of the habit");
    }
    res.redirect("/habitTracker");
  });
});

// Update habit Status
app.patch("/habitTracker/update-habit-status/:id", (req, res) => {
  const id = req.params.id;
  const status = req.body.status;
  const consult = "UPDATE habits SET  status = ?  WHERE id_habit = ?";
  connection.query(consult, [status, id], (err) => {
    if (err) {
      console.error("Error consult", err.message);
      return res.status(500).send("Error updating the habit");
    }
    res.json();
  });
});

//update habit data
app.patch("/habitTracker/update-habit-data/:id", (req, res) => {
  const id = req.params.id;
  const title = req.body.title;
  const description = req.body.description;
  const consult =
    "UPDATE habits SET title = ?, description = ?  WHERE id_habit = ?";
  connection.query(consult, [title, description, id], (err) => {
    if (err) {
      console.error("Error consult", err.message);
      return res.status(500).send("Error updating the habit");
    }
    res.json();
  });
});

// Delete habit
app.delete("/habitTracker/delete-habit/:id", (req, res) => {
  const id = req.params.id;
  const consult = "DELETE FROM habits WHERE id_habit = ?";
  connection.query(consult, [id], (err) => {
    if (err) {
      console.error("Error consult", err.message);
      return res.status(500).send("Error deleting the habit");
    }
    res.json();
  });
});
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto: http://localhost:${PORT}`);
});
