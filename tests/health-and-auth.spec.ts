import { test, expect, credentials } from '../fixtures/test';
import { TokenSchema } from '../schemas/booking';

test.describe('Health check and authentication', () => {
  test('GET /ping reports the service is up', async ({ api }) => {
    const started = Date.now();
    const response = await api.ping();
    expect(response.status()).toBe(201);
    expect(Date.now() - started, 'response time (ms)').toBeLessThan(5000);
  });

  test('POST /auth returns a token for valid credentials', async ({ api }) => {
    const response = await api.createToken(credentials.username, credentials.password);
    expect(response.status()).toBe(200);
    await expect(response).toMatchSchema(TokenSchema);
  });

  const badCredentials = [
    { name: 'wrong password', username: 'admin', password: 'nope' },
    { name: 'unknown user', username: 'not-a-user', password: 'password123' },
    { name: 'empty values', username: '', password: '' },
  ];

  for (const { name, username, password } of badCredentials) {
    test(`POST /auth does not issue a token for ${name}`, async ({ api }) => {
      const body = await (await api.createToken(username, password)).json();
      expect(body).not.toHaveProperty('token');
      expect(body).toEqual({ reason: 'Bad credentials' });
    });
  }
});
