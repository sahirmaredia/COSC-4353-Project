const express = require('express');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' })); // Allow credentials (cookies)
app.use(cookieParser());

// Session configuration
app.use(
  session({
    secret: 'your-secret-key', // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
      secure: false, // Set to true if using HTTPS
      maxAge: 1000 * 60 * 60 * 24, // Session expiration time (1 day)
      sameSite: 'strict', // Prevent CSRF attacks
    },
  })
);

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'nafisa0801',
  database: 'volunteerdb',
});

db.connect((err) => {
  if (err) throw err;
  console.log('MySQL Connected...');
});

// Register Route
app.post('/register', async (req, res) => {
  const { email, password, role } = req.body;

  // Validate role
  if (!role || !['admin', 'volunteer'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert into UserCredentials table
  const userQuery = 'INSERT INTO usercredentials (email, password, role) VALUES (?, ?, ?)';
  db.query(userQuery, [email, hashedPassword, role], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'User already exists' });
      }
      return res.status(500).json({ message: 'Database error' });
    }

    // Get the newly created user ID
    const userId = result.insertId;

    // Insert into UserProfile table with default values
    const profileQuery = `
      INSERT INTO userprofile (id, full_name, address1, address2, city, state, zip, skills, preferences, availability)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      profileQuery,
      [
        userId,
        '', // Default value for full_name
        '', // Default value for address1
        '', // Default value for address2
        '', // Default value for city
        '', // Default value for state
        '', // Default value for zip
        JSON.stringify([]), // Default value for skills
        '', // Default value for preferences
        JSON.stringify([]), // Default value for availability
      ],
      (err) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }
        // Success response
        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  });
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Find user in UserCredentials table
  const query = 'SELECT * FROM usercredentials WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const user = results[0];

    // Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Store user data in the session
    req.session.user = { id: user.id, email: user.email, role: user.role };

    // Send success response
    res.json({ message: 'Login successful', user: req.session.user });
  });
});

// Profile Route (GET)
app.get('/profile', (req, res) => {
  // Check if the user is authenticated
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Fetch user profile from the database
  const query = 'SELECT * FROM userprofile WHERE id = ?';
  db.query(query, [req.session.user.id], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.status(400).json({ message: 'User not found' });
    }

    const userProfile = results[0];
    res.json({
      user: {
        fullName: userProfile.full_name || '',
        address1: userProfile.address1 || '',
        address2: userProfile.address2 || '',
        city: userProfile.city || '',
        state: userProfile.state || '',
        zip: userProfile.zip || '',
        skills: userProfile.skills ? JSON.parse(userProfile.skills) : [],
        preferences: userProfile.preferences || '',
        availability: userProfile.availability ? JSON.parse(userProfile.availability) : [],
      },
    });
  });
});

// Profile Route (PUT)
app.put('/profile', async (req, res) => {
  console.log("Received update request:", req.body);
  // Check if the user is authenticated
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { fullName, address1, address2, city, state, zip, skills, preferences, availability } = req.body;

  console.log("Received update request:", req.body);

  // Update the user profile
  const query = `
    UPDATE userprofile
    SET full_name = ?, address1 = ?, address2 = ?, city = ?, state = ?, zip = ?, skills = ?, preferences = ?, availability = ?
    WHERE id = ?
  `;
  db.query(
    query,
    [
      fullName,
      address1,
      address2,
      city,
      state,
      zip,
      JSON.stringify(skills),
      preferences,
      JSON.stringify(availability),
      req.session.user.id,
    ],
    (err) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      // Return updated profile data
      res.json({
        message: 'Profile updated successfully',
        user: {
          fullName,
          address1,
          address2,
          city,
          state,
          zip,
          skills,
          preferences,
          availability,
        },
      });
    }
  );
});


app.post('/logout', (req, res) => {
  // Check if a session exists
  if (!req.session.user) {
    return res.status(400).json({ message: 'No session to logout' });
  }

  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.json({ message: 'Logout successful' });
  });
});

/*
// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
*/


module.exports = {app, db};