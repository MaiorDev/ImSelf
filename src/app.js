const express = require("express");
const connection = require("./public/js/db");
const app = express();
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); // Add this line to import jwt
const cookieParser = require("cookie-parser");
const { sendMail } = require("./services/mail.service.js");
const { sendMailResetPassword } = require("./services/password.service.js");
require("dotenv").config();

// Set the views directory path correctly
app.use(cookieParser());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static("public"));

app.get("/", (req, res) => {
  if (req.cookies.token) {
    try {
      // Decode the token to extract the email
      const decoded = jwt.verify(req.cookies.token, process.env.SECRET);
      const userEmail = decoded.userId || decoded.email;

      // Redirect to the menu route with the extracted email
      res.redirect(`/menu/${userEmail}`);
    } catch (error) {
      console.error("Error decoding token:", error.message);
      // If token is invalid, clear it and redirect to home
      res.clearCookie("token");
      res.render("index.ejs");
    }
    return;
  }
  res.render("index.ejs");
});

app.get("/forgot-password", (req, res) => {
  res.render("forgotPassword.ejs");
});
app.post("/auth/forgot-password", (req, res) => {
  const { email } = req.body;

  // Check if the email exists in the database
  const query = "SELECT * FROM users WHERE email =?";
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error in forgot password query:", err.message);
      return res.status(500).json({ error: "Error sending email" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Email not found" });
    }
    const username = results[0].username;
    const token = jwt.sign(
      { username: username, email: email },
      process.env.SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Send email verification
    (async () => {
      try {
        sendMailResetPassword(email, "Email verification", token, username);
      } catch (error) {
        console.error("Error enviando el correo:", error);
      }
    })();

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  });
});
app.get("/reset-password/:token", (req, res) => {
  const token = req.params.token;
  res.render("resetPassword.ejs", { token: token });
});

app.post("/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;
  jwt.verify(token, process.env.SECRET, (err, user) => {
    if (err) {
      console.error("Error verifying token:", err.message);
      return res.status(403).json({ message: "Invalid token" });
    }

    const { email } = user;
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Update the user's password in the database
    const updateQuery = "UPDATE users SET password = ? WHERE email = ?";
    connection.query(updateQuery, [hashedPassword, email], (updateErr) => {
      if (updateErr) {
        console.error("Error updating password:", updateErr.message);
        return res.status(500).json({ message: "Error updating password" });
      }

      res.json({ message: "Password updated successfully" });
    });
  });
});
app.get("/menu/:email", validateToken, (req, res) => {
  if (!req.params.email) {
    res.render("index.ejs");
    return;
  }
  const email = req.params.email;

  // Query the database directly in the route handler
  const query = "SELECT email, username FROM users WHERE email=?";
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err.message);
      return res.status(500).json({ error: "Error fetching user data" });
    }

    // Render the menu page with the user data
    res.render("menu.ejs", { user: results[0] });
  });
});
// Change from GET to POST for login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log("Login attempt:", email, password);

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const query = "SELECT * FROM users WHERE email = ? AND verified = 1";
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error in login query:", err.message);
      return res.status(500).json({ error: "Error during login process" });
    }

    // Check if user exists
    if (results.length === 0) {
      console.log("No user found with email:", email);
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = results[0];

    // Update login response to redirect with email
    bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
      if (bcryptErr) {
        console.error("Error comparing passwords:", bcryptErr.message);
        return res.status(500).json({ error: "Error during login process" });
      }

      // If passwords don't match
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // Create token with the correct user ID field
      const userEmail = user.email;
      const token = jwt.sign({ userId: userEmail }, process.env.SECRET, {
        expiresIn: "1h",
      });

      // Set the token as a cookie
      res.cookie("token", token, {
        maxAge: 3600000, // 1 hour
      });

      // Redirect to menu with email parameter instead of returning JSON
      res.json({
        userEmail: email,
      });
    });
  });
});
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// Make this route handler async to use await
app.post("/register/submit", async (req, res) => {
  const { username, email, password } = req.body;

  // Primero verificar si el correo ya existe en la base de datos
  const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
  connection.query(checkEmailQuery, [email], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Error checking email:", checkErr.message);
      return res
        .status(500)
        .json({ success: false, message: "Error checking user information" });
    }

    // Si el correo ya existe, enviar mensaje de error
    if (checkResults.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists. Please use a different email.",
      });
    }

    // create token - Fix: Use an object payload instead of a string
    const token = jwt.sign(
      { username: username, email: email },
      process.env.SECRET,
      {
        expiresIn: "24h",
      }
    );

    // Send email verification
    (async () => {
      try {
        sendMail(email, "Email verification", token, username);
      } catch (error) {
        console.error("Error enviando el correo:", error);
      }
    })();

    // Hash the password
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, (hashErr, hashedPassword) => {
      if (hashErr) {
        console.error("Error hashing password:", hashErr.message);
        return res
          .status(500)
          .json({ success: false, message: "Error hashing password" });
      }

      // Move the database insertion inside the bcrypt callback
      const insertQuery =
        "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
      connection.query(
        insertQuery,
        [username, email, hashedPassword],
        (insertErr) => {
          if (insertErr) {
            console.error("Error registering user:", insertErr.message);
            return res
              .status(500)
              .json({ success: false, message: "Error registering user" });
          }
          // Enviar respuesta JSON en lugar de renderizar la página
          res.json({
            success: true,
            message: "Registration successful",
            token: token,
          });
        }
      );
    });
  });
});

app.get("/verifyAccount", (req, res) => {
  res.render("verifyAccount.ejs");
});
app.post("resend-verification", async (req, res) => {
  const { email } = req.body;

  // Check if the email exists in the database
  const query = "SELECT * FROM users WHERE email =?";
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error in forgot password query:", err.message);
      return res.status(500).json({ error: "Error sending email" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Email not found" });
    }
    const username = results[0].username;
    const token = jwt.sign(
      { username: username, email: email },
      process.env.SECRET,
      {
        expiresIn: "1h",
      }(
        // Send email verification
        async () => {
          try {
            sendMail(email, "Email verification", token, username);
          } catch (error) {
            console.error("Error send email:", error);
          }
        }
      )
    );

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  });
});

// Update the verify route to include email in redirect
app.get("/verify/:token", (req, res) => {
  try {
    if (!req.params.token) {
      return res.redirect("/");
    }
    jwt.verify(req.params.token, process.env.SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }

      // Update the user's verified status in the database
      const userEmail = user.email;
      const updateQuery = "UPDATE users SET verified = true WHERE email =?";
      connection.query(updateQuery, [userEmail], (updateErr) => {
        if (updateErr) {
          console.error("Error verifying email:", updateErr.message);
          return res
            .status(500)
            .json({ success: false, message: "Error verifying email" });
        }
      });
      // Redirect to a success page or send a success response
      res.cookie("token", req.params.token, {
        maxAge: 3600000, // 1 hour
      });
      res.redirect(`/menu/${userEmail}`);
    });
  } catch (error) {
    console.error("Error verifying email:", error.message);
    res.status(500).json({ success: false, message: "Error verifying email" });
  }
});

//project routes
app.get("/projects/:email", validateToken, (req, res) => {
  const email = req.params.email;

  // Query the database for user data
  const query = "SELECT email, username FROM users WHERE email=?";
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err.message);
      return res.status(500).json({ error: "Error fetching user data" });
    }

    res.render("projects.ejs", { user: results[0] });
  });
});

//objectives routes
app.get("/objectives/:email", validateToken, (req, res) => {
  const email = req.params.email;

  // Query the database for user data
  const query = "SELECT email, username FROM users WHERE email=?";
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err.message);
      return res.status(500).json({ error: "Error fetching user data" });
    }

    res.render("objectives.ejs", { user: results[0] });
  });
});

//school routes
app.get("/school/:email", validateToken, (req, res) => {
  const email = req.params.email;

  // Query for subjects
  const subjectsQuery = "SELECT * FROM subjects WHERE user_email =?";
  // Query for user data
  const userQuery = "SELECT email, username FROM users WHERE email=?";

  // First get user data
  connection.query(userQuery, [email], (userErr, userResults) => {
    if (userErr) {
      console.error("Error fetching user data:", userErr.message);
      return res.status(500).json({ error: "Error fetching user data" });
    }

    // Then get subjects
    connection.query(subjectsQuery, [email], (subjectsErr, subjectsResults) => {
      if (subjectsErr) {
        console.error("Error fetching subjects:", subjectsErr.message);
        return res.status(500).json({ error: "Error fetching subjects" });
      }

      res.render("school", {
        user: userResults[0],
        subjects: subjectsResults,
      });
    });
  });
});
//add subject route
app.post("/school/addSubject", validateToken, (req, res) => {
  const data = req.body;
  const name = data.name;
  const description = data.description;
  const email = data.email;

  const consult = `INSERT INTO subjects (name_subject, description_subject, user_email) VALUES (?,?,?)`;
  connection.query(consult, [name, description, email], (err) => {
    if (err) {
      console.error("Error in database query:", err.message);
      return res.status(500).json({
        success: false,
        message: "Error in the registration of the subject",
      });
    }
    res.status(200).json({
      success: true,
      message: "Subject added successfully",
    });
  });
});

//delete subject route
app.delete("/school/deleteSubject/:id", (req, res) => {
  const subjectId = req.params.id;

  const deleteQuery = "DELETE FROM subjects WHERE id_subject =?";
  connection.query(deleteQuery, [subjectId], (err) => {
    if (err) {
      console.error("Error deleting subject:", err.message);
      return res.status(500).json({
        success: false,
        message: "Error deleting subject",
      });
    }

    // Send a success response
    res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });
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
// Update notes route
app.get("/notes/:email", validateToken, (req, res) => {
  const email = req.params.email;

  // Query the database for user data
  const query = "SELECT email, username FROM users WHERE email=?";
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err.message);
      return res.status(500).json({ error: "Error fetching user data" });
    }
    // Query the database for notes
    const notesQuery = "SELECT * FROM notes WHERE user_email=?";
    connection.query(notesQuery, [email], (notesErr, notesResults) => {
      if (notesErr) {
        console.error("Error fetching notes:", notesErr.message);
        return res.status(500).json({ error: "Error fetching notes" });
      }
      res.render("notes", {
        user: results[0],
        notes: notesResults,
      });
    });
  });
});

app.post("/notes/addNote", validateToken, (req, res) => {
  const data = req.body;
  const title = data.name;
  const text = data.text;
  const date = new Date();
  const email = data.email;

  const consult = `INSERT INTO notes (title_note, text_note, date, user_email) VALUES (?,?,?,?)`;
  connection.query(consult, [title, text, date, email], (err) => {
    if (err) {
      console.error("Error in database query:", err.message);
      return res.status(500).json({
        success: false,
        message: "Error in the registration of the note",
      });
    }

    res.status(200).json({
      success: true,
      message: "Note added successfully",
    });
  });
});
//delete notes route
app.delete("/notes/deleteNote/:id", (req, res) => {
  const noteId = req.params.id;

  const deleteQuery = "DELETE FROM notes WHERE id_note =?";
  connection.query(deleteQuery, [noteId], (err) => {
    if (err) {
      console.error("Error deleting note:", err.message);
      return res.status(500).json({
        success: false,
        message: "Error deleting note",
      });
    }

    // Send a success response
    res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  });
});
// Update habit tracker route
app.get("/habitTracker/:email", validateToken, (req, res) => {
  const email = req.params.email;

  // Query for habits
  const habitsQuery = "SELECT * FROM habits WHERE user_email =?";
  // Query for user data
  const userQuery = "SELECT email, username FROM users WHERE email=?";

  // First get user data
  connection.query(userQuery, [email], (userErr, userResults) => {
    if (userErr) {
      console.error("Error fetching user data:", userErr.message);
      return res.status(500).json({ error: "Error fetching user data" });
    }

    // Then get habits
    connection.query(habitsQuery, [email], (habitsErr, habitsResults) => {
      if (habitsErr) {
        console.error("Error fetching habits:", habitsErr.message);
        return res.status(500).json({ error: "Error fetching habits" });
      }

      res.render("habitTracker", {
        user: userResults[0],
        habits: habitsResults,
      });
    });
  });
});

app.post("/habitTracker/addHabit", validateToken, (req, res) => {
  const data = req.body;
  const title = data.title;
  const description = data.description;
  const date = new Date();
  const email = data.email;
  const consult = `INSERT INTO habits (title, description, status, date, user_email) VALUES (?, ?, 'pending', ?, ? )`;
  connection.query(consult, [title, description, date, email], (err) => {
    if (err) {
      console.error("Error consult", err.message);
      return res.status(500).send("Error in the registration of the habit");
    }
    res.redirect("/habitTracker");
  });
});

// Update habit Status
app.patch(
  "/habitTracker/update-habit-status/:id",
  validateToken,
  (req, res) => {
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
  }
);

//update habit data
app.patch("/habitTracker/update-habit-data/:id", validateToken, (req, res) => {
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
app.delete("/habitTracker/delete-habit/:id", validateToken, (req, res) => {
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

// NAV VAR
app.get("/config/:email", validateToken, (req, res) => {
  const email = req.params.email;
  // Query the database for user data
  const query = "SELECT email, username FROM users WHERE email=?";
  connection.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error fetching user data:", err.message);
      return res.status(500).json({ error: "Error fetching user data" });
    }
    res.render("config", { user: results[0] });
  });
});

//logout route
app.post("/config/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

function validateToken(req, res, next) {
  console.log("Validating token...");
  const accessToken = req.header("Authorization") || req.cookies.token;
  if (!accessToken) {
    return res.render("error");
  }

  jwt.verify(accessToken, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.render("error", { message: "Invalid token" });
    }

    // Extract user email from token
    const userEmail = decoded.userId || decoded.email;

    // Query the database for user data
    const query = "SELECT email, username FROM users WHERE email=?";
    connection.query(query, [userEmail], (dbErr, results) => {
      if (dbErr || results.length === 0) {
        console.error(
          "Error fetching user data:",
          dbErr ? dbErr.message : "User not found"
        );
        return res.status(500).json({ error: "Error fetching user data" });
      }

      // Add user data to request object
      req.user = results[0];

      // Add user data to res.locals so it's available to all templates
      res.locals.user = results[0];

      next();
    });
  });
}
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server listening in the port: http://localhost:${PORT}`);
});
