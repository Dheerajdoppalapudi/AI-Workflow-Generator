import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';
import bcrypt from "bcryptjs"; 
import { setupTestDb, cleanupTestDb, closePrismaConnection } from '../src/utils/testSetup.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let userToken;
let adminToken;
let userId;
let adminId;

beforeAll(async () => {
  process.env.NODE_ENV = 'test'; 
  await setupTestDb();
  
  let user = await prisma.user.findUnique({ where: { username: 'user_test' } });
  let admin = await prisma.user.findUnique({ where: { username: 'admin_test' } });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'user_test@example.com',
        username: 'user_test',
        password: await bcrypt.hash('user123', 10),
        role: 'USER'
      }
    });
  }
  
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin_test@example.com',
        username: 'admin_test',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN'
      }
    });
  }
  
  userId = user.id;
  adminId = admin.id;

  // Generate tokens matching controller format
  userToken = jwt.sign({ 
    userId: user.id, 
    username: user.username,
    role: user.role
  }, process.env.JWT_SECRET || "your_secret_key");
  
  adminToken = jwt.sign({ 
    userId: admin.id,
    username: admin.username,
    role: admin.role
  }, process.env.JWT_SECRET || "your_secret_key");
});

// Clean up after tests
afterAll(async () => {
  await cleanupTestDb();
  await closePrismaConnection();
});

describe('Protected Routes', () => {
  // Test profile endpoint
  describe('GET /api/users/profile', () => {
    it('should get user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', userId);
      expect(response.body.user).toHaveProperty('email', 'user@test.com');
      expect(response.body.user).toHaveProperty('username', 'user_test');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users/profile');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });

    it('should return 403 with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalidtoken');
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });
  });

  // Test profile update endpoint
  describe('PUT /api/users/profile', () => {
    it('should update user profile when authenticated', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'user_test@example.com' // Keep same email to avoid uniqueness conflicts
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .send({
          email: 'test@example.com'
        });
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
  });

  // Test admin routes
  describe('GET /api/users/admin/users', () => {
    it('should allow admin to access admin route', async () => {
      const response = await request(app)
        .get('/api/users/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check that user data is properly structured
      const firstUser = response.body[0];
      expect(firstUser).toHaveProperty('id');
      expect(firstUser).toHaveProperty('email');
      expect(firstUser).toHaveProperty('role');
      expect(firstUser).not.toHaveProperty('password');
    });

    it('should deny regular user access to admin route', async () => {
      const response = await request(app)
        .get('/api/users/admin/users')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error', 'Forbidden: Admin role required');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users/admin/users');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
  });
});