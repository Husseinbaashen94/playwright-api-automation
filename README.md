# Playwright API Automation

![Playwright API Tests](https://github.com/Husseinbaashen94/playwright-api-automation/actions/workflows/ci.yml/badge.svg)
![Playwright](https://img.shields.io/badge/Playwright-API%20testing-2EAD33?logo=playwright)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)

REST API test suite for [Restful-Booker](https://restful-booker.herokuapp.com/apidoc/index.html), a public hotel-booking API built for test practice. It uses **Playwright's `APIRequestContext`**, **TypeScript**, **Zod** contract schemas and **Faker** test data. No browser required.

> Part of a series that tests the same API with different stacks:
> [Cypress](https://github.com/Husseinbaashen94/cypress-api-automation) ·
> [Playwright](https://github.com/Husseinbaashen94/playwright-api-automation) ·
> [Java + Cucumber](https://github.com/Husseinbaashen94/java-cucumber-api-automation)

## What's covered

| Area | Scenarios |
|------|-----------|
| **Health & auth** | `/ping` is up within a time budget · token issued and schema-checked · no token for wrong password, unknown user, empty values |
| **CRUD** | create · read · list · full update (PUT) · partial update (PATCH) · delete → 404 |
| **Search filters** | by first name · by full name · no match → `[]` |
| **Negative & security** | unknown id → 404 · PUT/PATCH/DELETE without a token or with a forged token → 403 **and data verified unchanged** · invalid payload rejected |

## Design decisions

- **Typed API client.** `api/BookingClient.ts` wraps each endpoint, and `withToken()` returns an authenticated copy, so specs read `authedApi.update(id, booking)`.
- **Fixtures do the setup and the cleanup.**
  - `token` is **worker-scoped**: one login per worker process, not per test.
  - `seededBooking` creates a fresh booking for the test and **deletes it afterwards**, leaving the shared demo API clean.
- **Every test is independent.** There's no shared state or test ordering, so the suite runs fully in parallel.
- **Contract testing with Zod.** Schemas are `.strict()`, so an unexpected new field fails as loudly as a missing one. A custom matcher gives readable diffs:
  ```ts
  await expect(response).toMatchSchema(BookingSchema);
  ```
- **One source of truth for types.** Test data types come from the same Zod schemas (`z.infer`), so the factory, client and assertions can't drift apart.
- **Documented API quirks.** For example, `DELETE` returns `201` and bad input returns `500`. Each pinned behaviour has a comment explaining it.

## Project structure

```
api/BookingClient.ts       # typed endpoint client
schemas/booking.ts         # Zod contracts + inferred types
fixtures/
├── test.ts                # token, api, authedApi, seededBooking fixtures + toMatchSchema matcher
└── bookingFactory.ts      # Faker test-data builder
tests/                     # health-and-auth, booking-crud, booking-filters, booking-negative
```

## Run it

Requires Node.js 18+.

```bash
npm install
npm test             # run the suite
npm run report       # open the HTML report
BASE_URL=http://localhost:3001 npm test   # point at a local Restful-Booker
```

## CI

GitHub Actions type-checks and runs the suite on every push and pull request, and daily so that changes in the live API get noticed. The HTML report is uploaded as an artifact.
