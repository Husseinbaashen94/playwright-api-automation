import { test, expect, buildBooking } from '../fixtures/test';

test.describe('Booking search filters', () => {
  test('filters by first name, by full name, and returns [] when nothing matches', async ({ api, authedApi }) => {
    // Unique names so results aren't polluted by other users of the shared demo API.
    const firstname = `Qa${Date.now()}${test.info().workerIndex}`;
    const lastname = `${firstname}Last`;
    const { bookingid } = await (await api.create(buildBooking({ firstname, lastname }))).json();

    await test.step('by first name', async () => {
      const ids = (await (await api.list({ firstname })).json()).map((b: { bookingid: number }) => b.bookingid);
      expect(ids).toContain(bookingid);
    });

    await test.step('by first and last name', async () => {
      const body = await (await api.list({ firstname, lastname })).json();
      expect(body).toEqual([{ bookingid }]);
    });

    await test.step('no match returns an empty list', async () => {
      const response = await api.list({ firstname: `${firstname}-nobody` });
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual([]);
    });

    await authedApi.delete(bookingid);
  });
});
