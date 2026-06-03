# 🔗 ShortLink — URL Shortener with Analytics

A production-style, full-stack URL shortener built for the Katomaran hackathon. Users register with email + OTP verification, log in with JWT auth, create short links (with custom aliases, expiry, and bulk import), and explore a modern analytics dashboard with click trends and device/browser breakdowns.

The UI is a dark, enterprise-grade SaaS interface (think Dub.co / Vercel Analytics) — not a generic admin template.

---

## ✨ Highlights

- **Premium dark design system** — custom palette, Inter type scale, 8px spacing, glass cards, real charts (Recharts), light/dark toggle.
- **Enterprise auth** — signup → email OTP verification → JWT login, forgot/reset password with a signed reset ticket, refresh tokens, account lockout, reCAPTCHA hooks.
- **Hardened OTP** — 6-digit codes, 5-minute expiry, max 5 attempts, 60-second resend cooldown, single active code per purpose. **OTPs are never returned by the API in production.**
- **Analytics** — per-link click counts, last visit, recent visit log, daily trend chart, and device / browser / OS distribution donuts.
- **Pro URL table** — search, status filter, sortable columns, pagination, inline edit, copy, QR, public stats, soft delete.
- **Security** — bcrypt (12 rounds), Helmet headers, request logging (morgan), per-route rate limiting, owner-scoped queries, centralized error handler, CORS allow-list.

---

## 🧱 Tech Stack

| Layer    | Tech                                                        |
| -------- | ----------------------------------------------------------- |
| Frontend | React 19, Vite, React Router, Axios, Recharts               |
| Backend  | Node.js, Express 5                                          |
| Database | PostgreSQL                                                  |
| ORM      | Prisma                                                      |
| Auth     | JWT access (15m) + DB-backed refresh token (7d), bcrypt    |
| Security | Helmet, express-rate-limit, Google reCAPTCHA, morgan        |

---

## 🏗️ Architecture

```mermaid
flowchart LR
  subgraph Client["React + Vite (Client)"]
    A[Auth Pages] --> AX[Axios API client + JWT]
    D[Dashboard / Analytics] --> AX
    P[Public Stats] --> AX
  end

  subgraph API["Express API"]
    AX -->|/api/auth| AUTH[Auth Routes]
    AX -->|/api/url| URL[URL Routes]
    REDIR[/:shortCode redirect/]
    AUTH --> SVC1[auth.service]
    URL --> SVC2[url + dashboard service]
    REDIR --> SVC2
    MW[Helmet · CORS · Rate limit · reCAPTCHA · JWT]
  end

  subgraph DB["PostgreSQL via Prisma"]
    U[(User)]
    O[(UserOtp)]
    L[(Url)]
    V[(Visit)]
    R[(RefreshToken)]
    AL[(AuditLog)]
  end

  SVC1 --> U & O & R & AL
  SVC2 --> L & V & AL
  MAIL[(Email / console OTP)]
  SVC1 --> MAIL
```

### Data model

```mermaid
erDiagram
  User ||--o{ Url : owns
  User ||--o{ UserOtp : has
  User ||--o{ RefreshToken : has
  User ||--o{ AuditLog : generates
  Url  ||--o{ Visit : records

  User { int id string email string password enum status bool isVerified }
  UserOtp { int id enum purpose datetime expiresAt int attemptCount bool isUsed }
  Url { int id string shortCode string customAlias int totalClicks enum status datetime expiresAt }
  Visit { int id string browser string device string os string country datetime visitedAt }
  RefreshToken { int id string tokenHash datetime expiresAt datetime revokedAt }
  AuditLog { int id enum action json metadata }
```

### Project structure

```text
client/src
  components/   Button, Input, StatsCard, UrlForm, UrlTable, UrlRow, charts, icons
  layouts/      AuthLayout, DashboardLayout (sidebar + topbar + theme toggle)
  pages/        Login, Register, VerifyOtp, ForgotPassword, ResetPassword,
                Dashboard, Analytics, PublicStats
  services/     api (axios), toast
  index.css     design system (palette, radii, spacing, components)

server/src
  config/       prisma client, mailer (SMTP + dev console fallback)
  controllers/  auth, password, url, redirect, analytics, dashboard
  middleware/   auth (JWT), rateLimiter, recaptcha
  routes/       auth.routes, url.routes
  services/     auth.service, url.service, dashboard.service
  utils/        http (ok/fail/send), urlHelpers (validation, code gen, UA parse)
  app.js        Helmet, CORS allow-list, morgan, error handler
```

---

## 🚀 Setup

### 1. Database + server env

Create a PostgreSQL database, then `server/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/url_shortener_db"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="15m"
PORT=5000
BASE_URL="http://localhost:5000"
NODE_ENV="development"
CLIENT_ORIGINS="http://localhost:5173"
RECAPTCHA_SECRET_KEY="dev-disabled"

# Optional — when set, OTPs are emailed instead of printed to the console
# SMTP_HOST="smtp.example.com"
# SMTP_PORT=587
# SMTP_USER="apikey"
# SMTP_PASS="secret"
# SMTP_FROM="ShortLink <no-reply@shortlink.app>"
```

`client/.env`:

```env
VITE_API_URL="http://localhost:5000/api"
VITE_PUBLIC_BASE_URL="http://localhost:5000"
VITE_RECAPTCHA_SITE_KEY=""
```

### 2. Install + migrate

```bash
cd server
npm install
npx prisma migrate dev      # applies all migrations (incl. OTP attempt/used columns)
npx prisma generate         # stop the dev server first if you hit an EPERM lock on Windows

cd ../client
npm install
```

> **Windows note:** `prisma generate` renames a DLL the running server holds open. If you get `EPERM`, stop the API (`Ctrl+C`) and rerun `npx prisma generate`.

### 3. Run

```bash
# terminal 1
cd server && npm run dev      # http://localhost:5000

# terminal 2
cd client && npm run dev      # http://localhost:5173
```

When SMTP is not configured, the OTP is printed to the **server console** (and, in dev only, included in the API response for quick testing).

---

## 🔌 API Summary

| Method | Endpoint                          | Notes                                  |
| ------ | --------------------------------- | -------------------------------------- |
| POST   | `/api/auth/register`              | reCAPTCHA + rate-limited               |
| POST   | `/api/auth/verify-otp`            | attempt-limited                        |
| POST   | `/api/auth/login`                 | reCAPTCHA + lockout                    |
| POST   | `/api/auth/resend-otp`            | 60s cooldown                           |
| POST   | `/api/auth/forgot-password`       | enumeration-safe                       |
| POST   | `/api/auth/verify-reset-otp`      | returns short-lived `resetTicket`      |
| POST   | `/api/auth/reset-password`        | requires `resetTicket`                 |
| POST   | `/api/auth/refresh`               | new access token from refresh token    |
| POST   | `/api/auth/logout`                | revokes refresh token                  |
| POST   | `/api/url/create`                 | alias + expiry supported               |
| POST   | `/api/url/bulk`                   | up to 25 URLs                          |
| PATCH  | `/api/url/:id`                    | edit destination / expiry / status     |
| DELETE | `/api/url/:id`                    | soft delete                            |
| GET    | `/api/url/dashboard`              | stats, trend, breakdowns, links        |
| GET    | `/api/url/analytics/:shortCode`   | owner-only analytics                   |
| GET    | `/api/url/public/:shortCode`      | public-safe stats                      |
| GET    | `/:shortCode`                     | server-side redirect + visit capture   |

---

## 🎨 Design System

- **Colors** — Primary `#6366F1`, Secondary `#8B5CF6`, Success `#22C55E`, Warning `#F59E0B`, Danger `#EF4444`, Background `#0F172A`, Card `#1E293B`, Border `#334155`, Text `#F8FAFC`, Muted `#94A3B8`.
- **Type** — Inter (400–900).
- **Radii** — 12px buttons, 16px cards, pill badges.
- **Spacing** — 8px scale.
- **Light + dark** — toggle in the top navbar (persisted to `localStorage`).

---

## 📌 Assumptions

- **Email delivery is optional.** With no SMTP configured, OTPs are logged to the server console and returned by the API **only in development** (`NODE_ENV=development`). In production they are never exposed.
- `RECAPTCHA_SECRET_KEY=dev-disabled` bypasses captcha locally; set a real secret + matching site key in production.
- QR codes are rendered client-side via a public QR image endpoint (no external shortening service is used for the core logic).
- Country analytics reads proxy headers (e.g. `cf-ipcountry`) when present, otherwise `Unknown`.
- "Avg / Link" on the dashboard is total clicks ÷ total links (a meaningful stand-in for CTR, which needs impression data a shortener doesn't have).

---

## 🎥 Demo Video

> ▶️ **Add your Loom / YouTube link here before submitting** (required — submissions without a video are not reviewed).

---

## 🧠 AI Planning & Interview Notes

See [docs/AI_PLANNING.md](docs/AI_PLANNING.md) for the planning process, feature list, security audit, and interview Q&A.

---

This project is a part of a hackathon run by https://katomaran.com
