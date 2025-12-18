import { validateEnvironment } from '../../shared/validation/env-validator';

describe('Environment Validator', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should validate required environment variables', () => {
    process.env['NODE_ENV'] = 'development';
    process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test';
    process.env['JWT_SECRET'] = 'a-secure-jwt-secret-key-32-chars-long';
    process.env['JWT_REFRESH_SECRET'] = 'a-secure-refresh-secret-32-chars-l';

    const result = validateEnvironment();
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail when DATABASE_URL is missing', () => {
    delete process.env['DATABASE_URL'];
    process.env['JWT_SECRET'] = 'a-secure-jwt-secret-key-32-chars-long';
    process.env['JWT_REFRESH_SECRET'] = 'a-secure-refresh-secret-32-chars-l';

    const result = validateEnvironment();
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('DATABASE_URL'))).toBe(true);
  });

  it('should fail when JWT_SECRET is too short', () => {
    process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test';
    process.env['JWT_SECRET'] = 'short';
    process.env['JWT_REFRESH_SECRET'] = 'a-secure-refresh-secret-32-chars-l';

    const result = validateEnvironment();
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('JWT_SECRET'))).toBe(true);
  });

  it('should detect weak secrets in production', () => {
    process.env['NODE_ENV'] = 'production';
    process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test';
    process.env['JWT_SECRET'] = 'your-super-secret-jwt-key-here-change-in-production';
    process.env['JWT_REFRESH_SECRET'] = 'a-secure-refresh-secret-32-chars-l';
    process.env['SESSION_SECRET'] = 'a-secure-session-secret-32-chars-l';

    const result = validateEnvironment();
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('valor padrão/fraco'))).toBe(true);
  });

  it('should warn about missing optional configurations', () => {
    process.env['NODE_ENV'] = 'development';
    process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test';
    process.env['JWT_SECRET'] = 'a-secure-jwt-secret-key-32-chars-long';
    process.env['JWT_REFRESH_SECRET'] = 'a-secure-refresh-secret-32-chars-l';
    delete process.env['SMTP_HOST'];
    delete process.env['REDIS_URL'];
    delete process.env['REDIS_HOST'];

    const result = validateEnvironment();
    expect(result.warnings.some(w => w.includes('email'))).toBe(true);
    expect(result.warnings.some(w => w.includes('Redis'))).toBe(true);
  });
});



