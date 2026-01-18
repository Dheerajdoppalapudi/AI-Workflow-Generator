import jwt from 'jsonwebtoken';
import { authenticate, requireAdmin, authorize } from '../src/middleware/auth.js';

// Mock request, response, and next function
const mockRequest = () => {
  return {
    headers: {},
    user: {}
  };
};

const mockResponse = () => {
  const res = {};
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  res.json = function(data) {
    this.body = data;
    return this;
  };
  return res;
};

// Setup JWT environment
beforeAll(() => {
  process.env.JWT_SECRET = 'test-jwt-secret-key';
});

describe('Authentication Middleware', () => {
  describe('authenticate middleware', () => {
    test('should pass valid token and set req.user', () => {
      const token = jwt.sign({ userId: 1, role: 'USER' }, process.env.JWT_SECRET);
      const req = mockRequest();
      const res = mockResponse();
      
      let nextCalled = false;
      const next = () => { nextCalled = true; };
      
      req.headers.authorization = `Bearer ${token}`;
      
      authenticate(req, res, next);
      
      expect(nextCalled).toBe(true);
      expect(req.user).toHaveProperty('userId', 1);
      expect(req.user).toHaveProperty('role', 'USER');
    });

    test('should return 401 when no token is provided', () => {
      const req = mockRequest();
      const res = mockResponse();
      
      let nextCalled = false;
      const next = () => { nextCalled = true; };
      
      authenticate(req, res, next);
      
      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Unauthorized');
    });

    test('should return 403 when token is invalid', () => {
      const req = mockRequest();
      const res = mockResponse();
      
      let nextCalled = false;
      const next = () => { nextCalled = true; };
      
      req.headers.authorization = 'Bearer invalidtoken';
      
      authenticate(req, res, next);
      
      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error', 'Invalid token');
    });
  });

  describe('requireAdmin middleware', () => {
    test('should allow admin users to pass', () => {
      const req = mockRequest();
      const res = mockResponse();
      
      let nextCalled = false;
      const next = () => { nextCalled = true; };
      
      req.user.role = 'ADMIN';
      
      requireAdmin(req, res, next);
      
      expect(nextCalled).toBe(true);
    });

    test('should block non-admin users', () => {
      const req = mockRequest();
      const res = mockResponse();
      
      let nextCalled = false;
      const next = () => { nextCalled = true; };
      
      req.user.role = 'USER';
      
      requireAdmin(req, res, next);
      
      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error', 'Forbidden: Admin role required');
    });
  });

  describe('authorize middleware', () => {
    test('should allow users with permitted roles', () => {
      const req = mockRequest();
      const res = mockResponse();
      
      let nextCalled = false;
      const next = () => { nextCalled = true; };
      
      req.user.role = 'EDITOR';
      
      const middleware = authorize(['ADMIN', 'EDITOR']);
      middleware(req, res, next);
      
      expect(nextCalled).toBe(true);
    });

    test('should block users without permitted roles', () => {
      const req = mockRequest();
      const res = mockResponse();
      
      let nextCalled = false;
      const next = () => { nextCalled = true; };
      
      req.user.role = 'USER';
      
      const middleware = authorize(['ADMIN', 'EDITOR']);
      middleware(req, res, next);
      
      expect(nextCalled).toBe(false);
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('error', 'Forbidden: Insufficient permissions');
    });
  });
});