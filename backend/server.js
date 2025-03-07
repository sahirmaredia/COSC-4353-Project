const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = './users.json';

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());


// Secret key for JWT (use environment variable in production)
const JWT_SECRET = 'your-secret-key'; 


// Function to read users from a file
const readUsersFromFile = () => {
  if (fs.existsSync(path)) {
    const data = fs.readFileSync(path);
    return JSON.parse(data);
  }
  return []; // Return empty array if file doesn't exist
};

// Function to write users to a file
const writeUsersToFile = (users) => {
  fs.writeFileSync(path, JSON.stringify(users, null, 2));
};

const users = readUsersFromFile();


// Register route
app.post('/register', async(req, res) => {
    const { email, password, role } = req.body;

    if (!role || !['admin', 'volunteer'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
    // validate fields
    if(!email || !password){
        return res.status(400).json({ message: 'Email and Password are required' });
    }

    //Check if user already exists too
    const userExists = users.find(user => user.email === email);
    if(userExists){
        return res.status(400).json({ message: 'User already exists' });
    }

    //Hash password 
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = { 
      email, password: hashedPassword, role,  // Initialize a complete profile structure
      fullName: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      skills: [],
      preferences: '',
      availability: []
    };
    users.push(newUser);

    writeUsersToFile(users);


    res.status(201).json({ message: 'User registered successfully' });
});

//Login route
app.post('/login', async(req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if(!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user in "database"
    const user = users.find(user => user.email === email);
    if(!user){
        console.log("User not found:", email);
        return res.status(400).json({ message: 'User not found' });
    }

    //Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`Password valid: ${isPasswordValid}`); // Debug log
    if(!isPasswordValid){
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    //Return token to client
    res.json({ message: 'Login successful', token, role: user.role });
});

// Modify the existing profile route to handle both GET and POST requests
app.route('/profile')
  .get(async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = users.find(user => user.email === decoded.email);
      
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

       // Log the actual user data being sent
    console.log('GET /profile: Sending user data', {
      hasFullName: !!user.fullName,
      hasSkills: Array.isArray(user.skills),
      skillsCount: user.skills ? user.skills.length : 0,
      hasAvailability: Array.isArray(user.availability),
      availabilityCount: user.availability ? user.availability.length : 0
    });
    
      
      // Return user profile information
      res.json({
        user: {
          fullName: user.fullName || '',
          address1: user.address1 || '',
          address2: user.address2 || '',
          city: user.city || '',
          state: user.state || '',
          zip: user.zip || '',
          skills: Array.isArray(user.skills) ? user.skills : [],
          preferences: user.preferences || '',
          availability: Array.isArray(user.availability) ? user.availability : [],
        },
      });
    } catch (err) {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  })
  .post(async(req, res) => {
    // Your existing POST route logic remains the same
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = users.find(user => user.email === decoded.email);
      
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }
      
      // Destructure profile data from request body
      const { fullName, address1, address2, city, state, zip, skills, preferences, availability } = req.body;
      
      // Update user profile
      user.fullName = fullName || user.fullName;
      user.address1 = address1 || user.address1;
      user.address2 = address2 || user.address2;
      user.city = city || user.city;
      user.state = state || user.state;
      user.zip = zip || user.zip;
      user.skills = skills || user.skills;
      user.preferences = preferences || user.preferences;
      user.availability = availability || user.availability;
      
      // Send back updated user data
      res.json({
        message: 'Profile updated successfully',
        user: {
          fullName: user.fullName,
          address1: user.address1,
          address2: user.address2,
          city: user.city,
          state: user.state,
          zip: user.zip,
          skills: user.skills,
          preferences: user.preferences,
          availability: user.availability,
        },
      });
    } catch (err) {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  });

  // Volunteer Management

  // Volunteer History

  
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

//module.exports = app;