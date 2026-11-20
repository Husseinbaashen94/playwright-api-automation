import { test, expect, buildBooking } from '../fixtures/test';
import { type BookingClient } from '../api/BookingClient';

test.describe('Negative and security checks', () => {
  test('GET /booking/:id returns 404 for an id that does not exist', async ({ api }) => {
    expect((await api.get(999_999_999)).status()).toBe(404);
  });

  const unauthorisedWrites: { name: string; call: (api: BookingClient, id: number) => ReturnType<BookingClient['get']> }[] = [
    { name: 'PUT without a token', call: (api, id) => api.update(id, buildBooking()) },
    { name: 'PUT with a forged token', call: (api, id) => api.withToken('forged').update(id, buildBooking()) },
    { name: 'PATCH without a token', call: (api, id) => api.patch(id, { firstname: 'Hacked' }) },
    { name: 'DELETE without a token', call: (api, id) => api.delete(id) },
    { name: 'DELETE with a forged token', call: (api, id) => api.withToken('forged').delete(id) },
  ];

  for (const { name, call } of unauthorisedWrites) {
    test(`rejects ${name} with 403 and leaves the booking unchanged`, async ({ api, seededBooking }) => {
      const response = await call(api, seededBooking.id);
      expect(response.status()).toBe(403);

      const after = await api.get(seededBooking.id);
      expect(after.status()).toBe(200);
      expect(await after.json()).toEqual(seededBooking.booking);
    });
  }

  test('POST /booking rejects a payload missing a required field', async ({ api }) => {
    const { firstname: _omitted, ...withoutFirstname } = buildBooking();
    // Restful-Booker answers invalid input with 500 rather than 400; pinned so a change is noticed.
    expect((await api.create(withoutFirstname)).status()).toBe(500);
  });
});
