import { test, expect, buildBooking } from '../fixtures/test';
import { BookingSchema, BookingIdsSchema, CreateBookingResponseSchema } from '../schemas/booking';

test.describe('Booking CRUD', () => {
  test('POST /booking creates a booking and echoes it back', async ({ api, authedApi }) => {
    const booking = buildBooking();

    const response = await api.create(booking);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');
    await expect(response).toMatchSchema(CreateBookingResponseSchema);
    const body = await response.json();
    expect(body.booking).toEqual(booking);

    await authedApi.delete(body.bookingid);
  });

  test('GET /booking/:id returns the stored booking', async ({ api, seededBooking }) => {
    const response = await api.get(seededBooking.id);

    expect(response.status()).toBe(200);
    await expect(response).toMatchSchema(BookingSchema);
    expect(await response.json()).toEqual(seededBooking.booking);
  });

  test('GET /booking lists the booking id', async ({ api, seededBooking }) => {
    const response = await api.list();

    expect(response.status()).toBe(200);
    await expect(response).toMatchSchema(BookingIdsSchema);
    const ids = (await response.json()).map((b: { bookingid: number }) => b.bookingid);
    expect(ids).toContain(seededBooking.id);
  });

  test('PUT /booking/:id replaces the whole booking', async ({ api, authedApi, seededBooking }) => {
    const replacement = buildBooking({ firstname: 'Replaced' });

    const response = await authedApi.update(seededBooking.id, replacement);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual(replacement);
    expect(await (await api.get(seededBooking.id)).json()).toEqual(replacement);
  });

  test('PATCH /booking/:id changes only the given fields', async ({ authedApi, seededBooking }) => {
    const changes = { totalprice: 999, additionalneeds: 'Late checkout' };

    const response = await authedApi.patch(seededBooking.id, changes);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ...seededBooking.booking, ...changes });
  });

  test('DELETE /booking/:id removes the booking', async ({ api, authedApi }) => {
    const { bookingid } = await (await api.create(buildBooking())).json();

    const response = await authedApi.delete(bookingid);

    // Restful-Booker answers DELETE with 201 Created; documented quirk of the API.
    expect(response.status()).toBe(201);
    expect((await api.get(bookingid)).status()).toBe(404);
  });
});
