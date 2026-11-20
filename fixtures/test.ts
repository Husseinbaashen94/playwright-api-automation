import { test as base, expect as baseExpect, type APIResponse } from '@playwright/test';
import { type ZodType } from 'zod';
import { BookingClient } from '../api/BookingClient';
import { CreateBookingResponseSchema, type Booking } from '../schemas/booking';
import { buildBooking } from './bookingFactory';

export const credentials = {
  // Defaults are the public demo credentials published by Restful-Booker; set ADMIN_USER / ADMIN_PASSWORD in .env to override.
  username: process.env.ADMIN_USER || 'admin',
  password: process.env.ADMIN_PASSWORD || 'password123',
};

type TestFixtures = {
  api: BookingClient;
  authedApi: BookingClient;
  /** A booking created for this test and deleted afterwards. */
  seededBooking: { id: number; booking: Booking };
};

type WorkerFixtures = {
  /** One auth token per worker process, shared by its tests. */
  token: string;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  token: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext({
        baseURL: process.env.BASE_URL || 'https://restful-booker.herokuapp.com',
      });
      const response = await request.post('/auth', { data: credentials });
      const { token } = await response.json();
      if (!token) throw new Error('Could not obtain an auth token');
      await use(token);
      await request.dispose();
    },
    { scope: 'worker' },
  ],

  api: async ({ request }, use) => use(new BookingClient(request)),

  authedApi: async ({ api, token }, use) => use(api.withToken(token)),

  seededBooking: async ({ api, authedApi }, use) => {
    const booking = buildBooking();
    const response = await api.create(booking);
    baseExpect(response.status()).toBe(200);
    const { bookingid } = CreateBookingResponseSchema.parse(await response.json());

    await use({ id: bookingid, booking });

    // Teardown: leave the shared demo API as we found it.
    await authedApi.delete(bookingid);
  },
});

/** Custom matcher: await expect(response).toMatchSchema(Schema) */
export const expect = baseExpect.extend({
  async toMatchSchema(response: APIResponse, schema: ZodType) {
    const body = await response.json();
    const result = schema.safeParse(body);
    return {
      pass: result.success,
      name: 'toMatchSchema',
      message: () =>
        result.success
          ? 'expected body not to match schema'
          : `response body does not match schema:\n${result.error.issues
              .map((i) => `  • ${i.path.join('.') || '(root)'}: ${i.message}`)
              .join('\n')}\n\nbody: ${JSON.stringify(body, null, 2)}`,
    };
  },
});

export { buildBooking };
