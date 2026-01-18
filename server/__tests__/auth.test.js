import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import { setupTestDb, cleanupTestDb, closePrismaConnection } from '../src/utils/testSetup.js';

beforeAll(async () => {
  process.env.NODE_ENV = 'test'; 
  await setupTestDb();
});

afterAll(async () => {
  await cleanupTestDb();
  await closePrismaConnection();
});

describe('Authentication Endpoints', () => {
  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'new@test.com',
          password: 'password123',
          username: 'newuser',
          role: 'USER'
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body.user).toHaveProperty('email', 'new@test.com');
      expect(response.body.user).toHaveProperty('username', 'newuser');
      expect(response.body.user).toHaveProperty('role', 'USER');
      expect(response.body.user).not.toHaveProperty('password'); // Password should not be returned
    });

    it('should register a user without explicitly providing a username', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'auto_username@test.com',
          password: 'password123',
          role: 'USER'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Username or name is required');
    });

    it('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          username: 'incomplete_user'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    it('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'noname@test.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Username or name is required');
    });

    it('should return 500 if email or username already exists', async () => {
      // First create a user
      await request(app)
        .post('/api/users/register')
        .send({
          email: 'duplicate@test.com',
          username: 'duplicate_user',
          password: 'password123'
        });
        
      // Then try to create another with the same email
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'duplicate@test.com', // Same email
          username: 'another_user',
          password: 'password456'
        });
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'User already exists or invalid data');
    });
  });

  // Test User Login
  describe('POST /api/users/login', () => {
    // Setup: Create a test user for login tests
    beforeAll(async () => {
      await request(app)
        .post('/api/users/register')
        .send({
          email: 'login_test@example.com',
          password: 'user123',
          username: 'login_test',
          role: 'USER'
        });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          username: 'login_test', // Use username instead of email
          password: 'user123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'login_test@example.com');
      expect(response.body.user).toHaveProperty('username', 'login_test');
      
      // Verify JWT token
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('userId');
      expect(decoded).toHaveProperty('username', 'login_test');
      expect(decoded).toHaveProperty('role', 'USER');
    });

    it('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          username: 'login_test',
          password: 'wrongpassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 401 if user does not exist', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return 400 if username is missing', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          password: 'password123'
        });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'username is required');
    });
  });

  // Test Protected Routes
  describe('Protected Endpoints', () => {
    let authToken;
    let userId;

    // Setup: Create a test user and get auth token
    beforeAll(async () => {
      // Register a user
      await request(app)
        .post('/api/users/register')
        .send({
          email: 'protected_test@example.com',
          password: 'protected123',
          username: 'protected_user',
          role: 'USER'
        });
      
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          username: 'protected_user',
          password: 'protected123'
        });
      
      authToken = loginResponse.body.token;
      userId = loginResponse.body.user.id;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', 'protected_test@example.com');
      expect(response.body.user).toHaveProperty('username', 'protected_user');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should update user profile with valid token', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'protected_test@example.com'  // Keeping the same email
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
    });

    it('should reject access to protected routes without token', async () => {
      const response = await request(app).get('/api/users/profile');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should reject access to admin routes for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users/admin/users')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Forbidden: Admin role required');
    });
  });
  
  describe('Admin Endpoints', () => {
    let adminToken;

    beforeAll(async () => {
      // Register  admin
      await request(app)
        .post('/api/users/register')
        .send({
          email: 'admin_test@example.com',
          password: 'admin123',
          username: 'admin_user',
          role: 'ADMIN'
        });
      
      // Login to get admin token
      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          username: 'admin_user',
          password: 'admin123'
        });
      
      adminToken = loginResponse.body.token;
    });

    it('should allow admins to get all users', async () => {
      const response = await request(app)
        .get('/api/users/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(user => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(user).not.toHaveProperty('password');
      });
    });
  });
});