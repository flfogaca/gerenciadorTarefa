import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-jwt-secret-key-for-testing-only-32chars';
process.env['JWT_REFRESH_SECRET'] = 'test-jwt-refresh-secret-key-testing-32c';
process.env['DATABASE_URL'] = process.env['DATABASE_URL'] || 'postgresql://test:test@localhost:5432/gestorpro_test';

jest.setTimeout(30000);

beforeAll(async () => {
  console.log('🧪 Starting test suite...');
});

afterAll(async () => {
  console.log('🧪 Test suite completed.');
});





