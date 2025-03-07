const request = require('supertest');
const app = require('../server'); // Adjust if needed

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

  it('should fail to login with invalid credentials', async () => {
    const res = await request(app).post('/login').send({
      email: 'test@example.com',
      password: 'wrongPassword',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });

  it('should login successfully and return a token', async () => {
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
    expect(res.body.token).toBeDefined();
    expect(res.body.message).toBe('Login successful');
  });

  // Test /profile route
  it('should fail to access profile without token', async () => {
    const res = await request(app).get('/profile');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('No token provided');
  });

  it('should fail to access profile with invalid token', async () => {
    const res = await request(app).get('/profile').set('Authorization', 'Bearer invalidToken');
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  it('should get profile data with valid token', async () => {
    const loginRes = await request(app).post('/login').send({
      email: 'test@example.com',
      password: 'password',
    });
    const token = loginRes.body.token;

    const res = await request(app).get('/profile').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
  });

  it('should update profile with valid data', async () => {
    const loginRes = await request(app).post('/login').send({
      email: 'test@example.com',
      password: 'password',
    });
    const token = loginRes.body.token;

    const res = await request(app).post('/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Test User', city: 'New City' });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Profile updated successfully');
    expect(res.body.user.fullName).toBe('Test User');
  });
});
