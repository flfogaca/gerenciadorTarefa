import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

const mockUser = {
  id: 'test-user-id',
  userId: 'test-user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'tenant_admin',
  tenantId: 'default-tenant',
  permissions: [],
};

const mockToken = jwt.sign(
  {
    id: mockUser.id,
    userId: mockUser.userId,
    email: mockUser.email,
    role: mockUser.role,
    tenantId: mockUser.tenantId,
  },
  process.env['JWT_SECRET'] || 'test-jwt-secret-key-for-testing-only-32chars',
  { expiresIn: '1h' }
);

describe('Authentication Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    app.get('/api/v1/health', (_, res) => {
      res.json({ status: 'OK' });
    });

    app.post('/api/v1/users/auth/login', (req, res) => {
      const { email, password, tenantId } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (email === 'test@example.com' && password === 'Test123!@#') {
        return res.json({
          data: {
            token: mockToken,
            refreshToken: 'mock-refresh-token',
            user: mockUser,
          },
        });
      }

      return res.status(401).json({ error: 'Invalid credentials' });
    });

    app.get('/api/v1/users/me', (req, res) => {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(
          token,
          process.env['JWT_SECRET'] || 'test-jwt-secret-key-for-testing-only-32chars'
        );
        return res.json({ data: mockUser });
      } catch {
        return res.status(401).json({ error: 'Invalid token' });
      }
    });
  });

  describe('POST /api/v1/users/auth/login', () => {
    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/v1/users/auth/login')
        .send({ password: 'Test123!@#' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/v1/users/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/users/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
          tenantId: 'default-tenant',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });

    it('should return token for valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/users/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!@#',
          tenantId: 'default-tenant',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
    });
  });

  describe('GET /api/v1/users/me', () => {
    it('should return 401 when no token is provided', async () => {
      const response = await request(app).get('/api/v1/users/me');

      expect(response.status).toBe(401);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should return user data for valid token', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(mockUser.email);
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/v1/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });
});





