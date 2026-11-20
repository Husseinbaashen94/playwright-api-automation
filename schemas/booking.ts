import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected YYYY-MM-DD');

/** Contract for a booking, used both to validate responses and to type test data. */
export const BookingSchema = z
  .object({
    firstname: z.string().min(1),
    lastname: z.string().min(1),
    totalprice: z.number(),
    depositpaid: z.boolean(),
    bookingdates: z.object({ checkin: isoDate, checkout: isoDate }).strict(),
    additionalneeds: z.string().optional(),
  })
  .strict();

export const CreateBookingResponseSchema = z
  .object({
    bookingid: z.number().int().positive(),
    booking: BookingSchema,
  })
  .strict();

export const BookingIdsSchema = z.array(z.object({ bookingid: z.number().int() }).strict());

export const TokenSchema = z.object({ token: z.string().min(10) }).strict();

export type Booking = z.infer<typeof BookingSchema>;
