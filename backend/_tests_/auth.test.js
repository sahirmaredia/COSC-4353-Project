const request = require('supertest');
const {app, db} = require('../server'); // Adjust if needed

describe('Auth Routes', () => {
  // Test /register route
  it('should fail to register with missing email', async () => {
    const res = await request(app).post('/register').send({
      password: 'password',
      role: 'admin',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and Password are required');
  });

  it('should fail to register with missing password', async () => {
    const res = await request(app).post('/register').send({
      email: 'test@example.com',
      role: 'admin',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and Password are required');
  });

  it('should fail to register with invalid role', async () => {
    const res = await request(app).post('/register').send({
      email: 'test@example.com',
      password: 'password',
      role: 'invalidRole',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid role');
  });

  it('should register a user successfully', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    const res = await request(app).post('/register').send({
      email: uniqueEmail,
      password: 'password',
      role: 'admin',
    });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  it('should fail to register with an existing user', async () => {
    await request(app).post('/register').send({
      email: 'test@example.com',
      password: 'password',
      role: 'admin',
    }); // First registration

    const res = await request(app).post('/register').send({
      email: 'test@example.com',
      password: 'password',
      role: 'admin',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('User already exists');
  });

  // Test /login route
  it('should fail to login with missing email', async () => {
    const res = await request(app).post('/login').send({
      password: 'password',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });

  it('should fail to login with missing password', async () => {
    const res = await request(app).post('/login').send({
      email: 'test@example.com',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Email and password are required');
  });

  it('should fail to login with invalid credentials', async () => {
    const res = await request(app).post('/login').send({
      email: 'test@example.com',
      password: 'wrongPassword',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should login successfully and return a session', async () => {
    await request(app).post('/register').send({
      email: 'test@example.com',
      password: 'password',
      role: 'admin',
    }); // Ensure user is registered

    const res = await request(app).post('/login').send({
      email: 'test@example.com',
      password: 'password',
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.user).toBeDefined();
  });

  // Test /profile route
  it('should fail to access profile without authentication', async () => {
    const res = await request(app).get('/profile');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Unauthorized');
  });

  it('should get profile data with valid session', async () => {
    // Register and login to get a session
    await request(app).post('/register').send({
      email: 'test@example.com',
      password: 'password',
      role: 'admin',
    });
    const loginRes = await request(app).post('/login').send({
      email: 'test@example.com',
      password: 'password',
    });

    // Use the session to access the profile
    const res = await request(app)
      .get('/profile')
      .set('Cookie', loginRes.headers['set-cookie']);
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
  });

  it('should update profile with valid data', async () => {
    // Register and login to get a session
    await request(app).post('/register').send({
      email: 'test@example.com',
      password: 'password',
      role: 'admin',
    });
    const loginRes = await request(app).post('/login').send({
      email: 'test@example.com',
      password: 'password',
    });

    // Use the session to update the profile
    const res = await request(app)
      .put('/profile')
      .set('Cookie', loginRes.headers['set-cookie'])
      .send({
        fullName: 'Test User',
        address1: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zip: '12345',
        skills: ['testing'],
        preferences: 'none',
        availability: ['weekends'],
      });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Profile updated successfully');
    expect(res.body.user.fullName).toBe('Test User');
  });

  // Test /logout route
  it('should logout successfully', async () => {
    // Register and login to get a session
    await request(app).post('/register').send({
      email: 'test@example.com',
      password: 'password',
      role: 'admin',
    });
    const loginRes = await request(app).post('/login').send({
      email: 'test@example.com',
      password: 'password',
    });

    // Use the session to logout
    const res = await request(app)
      .post('/logout')
      .set('Cookie', loginRes.headers['set-cookie']);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logout successful');
  });

  it('should fail to logout without a session', async () => {
    const res = await request(app).post('/logout');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('No session to logout');
  });

  it('should handle database errors during registration', async () => {
    // Mock the database to simulate an error
    jest.spyOn(db, 'query').mockImplementation((query, params, callback) => {
      callback(new Error('Database error'));
    });
  
    const res = await request(app).post('/register').send({
      email: 'test@example.com',
      password: 'password',
      role: 'admin',
    });
  
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Database error');
  });
  

  afterAll(async () => {
    // Close the database connection after all tests are done
    await new Promise((resolve) => db.end(resolve));
  });
});