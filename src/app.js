const express = require("express");
const connection = require("./public/js/db");
const app = express();
const path = require("path");

// Set the views directory path correctly
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

//project routes
app.get("/projects", (req, res) => {
  res.render("projects.ejs");
});

//objectives routes
app.get("/objectives", (req, res) => {
  res.render("objectives.ejs");
});

//school routes
app.get("/school", (req, res) => {
  const consult = "SELECT * FROM subjects";
  connection.query(consult, (error, results) => {
    if (error) {
      throw error;
    }
    res.render("school", { subjects: results });
  });
});

// Add subject
app.post("/school/addSubject", (req, res) => {
  const { name, description } = req.body;
  const consult = "INSERT INTO subjects (name, description) VALUES (?, ?)";
  connection.query(consult, [name, description], (err) => {
    if (err) {
      console.error("Error adding subject:", err.message);
      return res.status(500).json({ error: "Error adding subject" });
    }
    res.redirect("/school");
  });
});

// Delete subject
app.delete("/school/deleteSubject/:id", (req, res) => {
  const id = req.params.id;
  const consult = "DELETE FROM subjects WHERE id_subject = ?";

  connection.query(consult, [id], (err, result) => {
    if (err) {
      console.error("Error deleting subject:", err.message);
      return res.status(500).json({ error: "Error deleting subject" });
    }
    res.json({ success: true });
  });
});

// School homeworks
app.get("/school/homework/:subject", (req, res) => {
  const subject = req.params.subject;
  const consult = `SELECT * FROM homeworks where subject = ?`;
  connection.query(consult, subject, (error, results) => {
    if (error) {
      console.error("Error fetching homework:", error);
      return res.status(500).json({ error: "Error fetching homework data" });
    }

    res.json({ homework: results });
  });
});

// Add homework
app.post("/school/addHomework/:subject", (req, res) => {
  const subject = req.params.subject;
  const data = req.body;
  const title = data.title;
  const description = data.description;
  const dueDate = data.dueDate;
  const consult = `INSERT INTO homeworks (title_hw, description_hw, subject, due_date_hw) VALUES (?,?,?,?)`;
  connection.query(consult, [title, description, subject, dueDate], (err) => {
    if (err) {
      console.error("Error consult", err.message);
      return res.status(500).send("Error in the registration of the homework");
    }
    res.redirect(`/school/homework/${subject}`);
  });
});

// Delete homework
app.delete("/school/deleteHomework/:id", (req, res) => {
  const id = req.params.id;
  const consult = "DELETE FROM homeworks WHERE id_homework =?";
  connection.query(consult, [id], (err) => {
    if (err) {
      console.error("Error consult", err.message);
      return res.status(500).send("Error deleting the homework");
    }
    res.json();
  });
});

//Edit homework
app.patch("/school/editHomework/:id", (req, res) => {
  const id = req.params.id;
  const title = req.body.title;
  const description = req.body.description;
  const dueDate = req.body.dueDate;
  const consult =
    "UPDATE homeworks SET title_hw =?, description_hw =?, due_date_hw =? WHERE id_homework =?";
  connection.query(consult, [title, description, dueDate, id], (err) => {
    if (err) {
      console.error("Error consult", err.message);
      return res.status(500).send("Error updating the homework");
    }
    res.json();
  });
});
//notes routes
app.get("/notes", (req, res) => {
  res.render("notes.ejs");
});

//Habit tracker routes
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
  console.log(`Server listening in the port: http://localhost:${PORT}`);
});
