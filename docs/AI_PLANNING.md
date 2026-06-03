# AI Planning And Interview Notes

## Current Project Analysis

Existing implementation already had an Express API, Prisma schema, JWT auth, OTP verification, password reset controllers, dashboard endpoint, redirect endpoint, React auth pages, dashboard, and analytics page.

## Missing Features Report

The main gaps against the problem statement were collision-safe short code generation, custom aliases, URL expiry behavior, soft delete, analytics ownership checks, richer analytics fields, public stats, bulk URL creation, edit destination URL, QR action, stronger HTTP statuses, environment-based frontend config, README, architecture documentation, and interview notes.

## Security Audit

Password hashing with bcrypt and JWT auth were already present. Improvements made:

- Auth failures now return proper `401`, `403`, `409`, or `422` statuses.
- Dashboard and private analytics are scoped to the logged-in user.
- Soft deleted URLs are excluded from dashboard and redirects.
- Expired or inactive URLs no longer redirect.
- Refresh tokens are stored hashed in PostgreSQL.
- Signup, login, and forgot password are protected by reCAPTCHA middleware.
- URL input is validated server-side.

Hardening completed in this iteration:

- OTPs are no longer returned by the API in production. Delivery moves to email (SMTP) with a console fallback in dev; the API only echoes the code when `NODE_ENV=development` and no SMTP is configured.
- OTP rules now match spec: 6 digits, 5-minute expiry, max 5 attempts, 60-second resend cooldown, and a single active code per purpose (`attemptCount` + `isUsed` columns added to `UserOtp`).
- Passwords must contain uppercase, lowercase, a number, and a special character (min 8).
- Access tokens default to 15 minutes; refresh tokens last 7 days and are revoked on password reset.
- Forgot-password is enumeration-safe and reset requires a short-lived signed `resetTicket` minted at OTP verification.
- Helmet security headers, morgan request logging, a CORS allow-list, env-driven `PORT`, and a centralized error handler were added to `app.js`. bcrypt cost raised to 12.

Remaining production hardening:

- Add CSRF protection if tokens move to cookies.
- Add automated tests for auth and URL ownership.
- Add structured logging (Winston/Pino) and log shipping.

## Architecture Upgrade Plan

```text
client/src
  components/   reusable buttons, inputs, stats, URL rows/tables
  pages/        auth, dashboard, analytics, public stats
  services/     axios API client
  routes/       app route declarations

server/src
  config/       Prisma and mailer setup
  controllers/  HTTP request/response handlers
  middleware/   auth, rate limit, reCAPTCHA
  routes/       REST API routes
  services/     business logic
  utils/        validation, response, URL helpers
```

## Database Upgrade Plan

Models:

- `User`: status, verification, failed login lock, soft delete
- `UserOtp`: register/login/password OTP storage
- `Url`: original URL, short code, alias, click count, status, expiry, soft delete
- `Visit`: timestamp, IP, browser, device, OS, country, referrer, user agent
- `RefreshToken`: hashed refresh token, expiry, revocation
- `AuditLog`: user action history

## Backend Improvements

- `POST /api/url/create` supports `originalUrl`, `customAlias`, `expiresAt`.
- `POST /api/url/bulk` creates up to 25 URLs.
- `PATCH /api/url/:id` edits destination, status, and expiry.
- `DELETE /api/url/:id` soft deletes.
- `GET /api/url/analytics/:shortCode` returns private analytics only for the owner.
- `GET /api/url/public/:shortCode` returns public-safe stats.
- `GET /:shortCode` records analytics and handles expired/inactive links.

## Frontend Improvements

- Dashboard cards for total, active, expired, and click counts.
- URL form supports alias, expiry, and bulk creation.
- Table includes copy, edit, delete, analytics, public stats, and QR actions.
- Analytics page shows recent visits, daily trends, and distributions.
- Responsive sidebar/topbar dashboard layout.

## UI/UX Improvements

- A complete dark, enterprise-grade design system in `index.css`: brand palette (#6366F1 / #8B5CF6 on #0F172A / #1E293B), Inter type scale, 8px spacing, 12px buttons, 16px cards, gradients, and glass cards.
- App shell with a fixed sidebar (icon nav), sticky top navbar (search, notifications, profile, light/dark toggle), and a hero "quick create" section.
- Real charts via Recharts: daily click-trend area chart and device / browser / OS donut charts on both the dashboard and per-link analytics.
- Professional data table: search, status filter, sortable columns, pagination, inline edit, and icon actions (copy, analytics, QR, public, delete).
- Toast notifications replace `alert()`; skeleton loaders and spinners cover loading states; dashed empty states for no-data.
- Live password-strength checklist on signup and a 60-second resend countdown on OTP screens.
- Fully responsive down to mobile (sidebar collapses to an icon rail; grids stack).

## Feature Implementation Plan

Completed:

- Mandatory auth, dashboard, redirect, analytics, validation, and responsive UI.
- Bonus alias, QR action, expiry, public stats, edit URL, bulk create, device/browser/OS analytics.

Done in this iteration:

- Charts with Recharts (trend area + distribution donuts).
- Toast notifications and a delete confirmation.
- Email delivery wired through the mailer config with a dev console fallback.

Next:

- CSV file upload parsing rather than newline paste for bulk import.
- Dedicated Settings / Profile pages (change password while logged in, manage sessions).
- Automated tests and CI.

## Project Explanation Script

This app is a full-stack URL shortener. A user registers, verifies OTP, and logs in with JWT auth. The dashboard lets the user create links with optional custom aliases and expiry dates. Each redirect is handled by the Express server, which validates the short code, blocks expired or inactive links, increments click count, and stores visit analytics in PostgreSQL. The dashboard and analytics endpoints are protected so each user only sees their own links. Prisma models support soft delete, refresh tokens, OTPs, and audit logs to make the design closer to production.

## Interview Questions And Answers

Q: How do you ensure short codes are unique?
A: The backend checks the database before accepting an alias or generated code and retries random generation several times. The database also enforces uniqueness.

Q: How do you protect user data?
A: Dashboard, edit, delete, and private analytics queries include both the URL identifier and `userId` from the JWT payload.

Q: Why soft delete URLs?
A: It keeps historical analytics and auditability while hiding the URL from active dashboard and redirect flows.

Q: How is analytics captured?
A: The redirect controller reads IP, user agent, referrer, and country headers. The service derives browser, device, and OS and stores one `Visit` row per redirect.

Q: What would you improve before production?
A: Email OTP delivery, automated tests, structured logs, cookie-based refresh tokens, real chart components, and deployment secrets management.
