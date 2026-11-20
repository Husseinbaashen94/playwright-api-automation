import { type APIRequestContext, type APIResponse } from '@playwright/test';
import { type Booking } from '../schemas/booking';

export interface BookingFilters {
  firstname?: string;
  lastname?: string;
  checkin?: string;
  checkout?: string;
}

/**
 * Typed client for the Restful-Booker API.
 * Methods return the raw APIResponse so tests can assert on status, headers and body.
 */
export class BookingClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token?: string,
  ) {}

  /** Returns a client that sends the auth cookie on write calls. */
  withToken(token: string) {
    return new BookingClient(this.request, token);
  }

  private authHeaders(): Record<string, string> {
    return this.token ? { Cookie: `token=${this.token}` } : {};
  }

  ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  createToken(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  list(filters: BookingFilters = {}): Promise<APIResponse> {
    return this.request.get('/booking', { params: { ...filters } });
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  create(booking: Partial<Booking>): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  update(id: number, booking: Booking): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: booking, headers: this.authHeaders() });
  }

  patch(id: number, fields: Partial<Booking>): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: fields, headers: this.authHeaders() });
  }

  delete(id: number): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: this.authHeaders() });
  }
}
