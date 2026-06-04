# ShortLink — URL Shortener with Analytics

A full-stack URL shortener built for the Katomaran hackathon. Users sign up with email + OTP verification, log in with JWT, create short links (custom alias, expiry, bulk), and view a modern analytics dashboard with click trends and device/browser breakdowns.

**Stack:** React + Vite · Node.js + Express · PostgreSQL + Prisma

---

## Table of Contents

1. [Setup Instructions](#1-setup-instructions)
2. [Assumptions](#2-assumptions)
3. [Features](#3-features)
4. [AI Planning & Architecture Diagram](#4-ai-planning--architecture-diagram)
5. [API Endpoints](#5-api-endpoints)
6. [Sample Output](#6-sample-output-logs-images-db-entries)
7. [Demo Video](#7-demo-video)

---

## 1. Setup Instructions

### Prerequisites

- **Node.js** v18+ — <https://nodejs.org>
- **PostgreSQL** v14+ (running locally) — <https://www.postgresql.org/download/>
- **Git**
- *(Optional)* a **Gmail account** for OTP email. Without it, OTPs print to the server console.

### Step 1 — Clone the repository

```bash
git clone https://github.com/rasigapriyas/url-shortener.git
cd url-shortener
```

### Step 2 — Create the database

In `psql` or pgAdmin:

```sql
CREATE DATABASE url_shortener_db;
```

### Step 3 — Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
# Database (use your own Postgres user/password)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/url_shortener_db"

# Auth
JWT_SECRET="any-long-random-string"
JWT_EXPIRES_IN="15m"

# Server
PORT=5000
NODE_ENV="development"
BASE_URL="http://localhost:5000"
CLIENT_ORIGINS="http://localhost:5173"

# reCAPTCHA ("dev-disabled" turns it off locally)
RECAPTCHA_SECRET_KEY="dev-disabled"

# Email (OPTIONAL). If omitted, OTPs print to the server console.
# Gmail: enable 2-Step Verification, create an App Password, paste it (no spaces).
# SMTP_HOST="smtp.gmail.com"
# SMTP_PORT=587
# SMTP_USER="youraddress@gmail.com"
# SMTP_PASS="your16charapppassword"
# SMTP_FROM="ShortLink <youraddress@gmail.com>"
```

Create the tables and start the API:

```bash
npx prisma migrate deploy   # creates all tables
npx prisma generate         # generates the DB client
npm run dev                 # API → http://localhost:5000
```

> **Windows tip:** if `prisma generate` shows `EPERM`, stop the server (Ctrl+C) and run it again.

### Step 4 — Frontend (second terminal)

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL="http://localhost:5000/api"
VITE_PUBLIC_BASE_URL="http://localhost:5000"
VITE_RECAPTCHA_SITE_KEY=""
```

Start it:

```bash
npm run dev                 # App → http://localhost:5173
```

### Step 5 — Use the app

Open **<http://localhost:5173>**, register, verify the OTP (from email or the server console), and start shortening URLs.

> Always run the backend with `npm run dev` (not `npm start`) so it auto-reloads.

---

## 2. Assumptions

- **Email is optional.** Without SMTP configured, OTPs are printed to the server console (and, only in development, returned by the API for testing). In production they are never exposed.
- `RECAPTCHA_SECRET_KEY=dev-disabled` bypasses captcha locally; set a real key in production.
- QR codes are generated client-side via a public QR image endpoint (no external service is used for the core shortening logic).
- Country analytics uses the `cf-ipcountry` proxy header when available, otherwise `Unknown`.
- "Avg / Link" on the dashboard = total clicks ÷ total links.

---

## 3. Features

**Mandatory**

- Signup & login with email OTP verification
- JWT-protected dashboard routes; each user manages only their own URLs
- Create unique short codes from long URLs (with backend URL validation)
- Server-side redirect from short URL → original
- Dashboard shows original URL, short URL, created date, total clicks
- Delete a URL (soft delete) and copy the short URL from the UI
- Click count + visit timestamp stored in the database
- Per-URL analytics: total clicks, last visit, recent visit history
- Responsive UI with loading / success / error states and form validation

**Bonus**

- Custom alias · QR code · link expiry · edit destination URL
- Device / browser / OS analytics (country via proxy header)
- Daily click-trend charts (Recharts) · public stats page · bulk creation

---

## 4. AI Planning & Architecture Diagram

**AI planning documents** (process, feature list, security audit, and a full code walkthrough):

- [docs/AI_PLANNING.md](docs/AI_PLANNING.md)
- [docs/INTERVIEW_GUIDE.md](docs/INTERVIEW_GUIDE.md)

### Architecture (3-tier)

```text
┌──────────────────────────────────────────────────────────────┐
│  CLIENT  —  React + Vite        (http://localhost:5173)        │
│  Pages: Login · Register · VerifyOtp · Dashboard · Analytics   │
│  Axios attaches the JWT to every request                       │
└───────────────────────────┬──────────────────────────────────┘
                            │  REST  (JSON over HTTP)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│  SERVER  —  Node.js + Express   (http://localhost:5000)        │
│                                                                │
│   Middleware:  Helmet → CORS → JSON → Rate-limit →             │
│                reCAPTCHA → JWT auth                            │
│                                                                │
│   Routes  →  Controllers  →  Services (business logic)         │
│                                   │                            │
│                                   └──►  Nodemailer → Gmail SMTP │
└───────────────────────────────────┬────────────────────────────┘
                                    │  Prisma ORM (parameterized → no SQL injection)
                                    ▼
┌──────────────────────────────────────────────────────────────┐
│  DATABASE  —  PostgreSQL                                       │
│  User · UserOtp · Url · Visit · RefreshToken · AuditLog        │
└──────────────────────────────────────────────────────────────┘
```

### Data model (relations)

```text
User  1───*  Url   1───*  Visit
User  1───*  UserOtp
User  1───*  RefreshToken
User  1───*  AuditLog

User          id, name, email (unique), password (bcrypt), status, isVerified
UserOtp       id, userId, otp, purpose, expiresAt, attemptCount, isUsed
Url           id, userId, originalUrl, shortCode (unique), customAlias,
              totalClicks, status, expiresAt, deletedAt
Visit         id, urlId, ipAddress, browser, device, os, country, visitedAt
RefreshToken  id, userId, tokenHash (sha256), expiresAt, revokedAt
AuditLog      id, userId, action, metadata, createdAt
```

### Request flow — creating & clicking a short link

```text
1. User submits a long URL  →  POST /api/url/create
2. Server validates the URL, generates a unique base62 code, saves the Url row
3. Anyone opens  http://localhost:5000/<shortCode>   (GET /:shortCode)
4. Server finds the link, increments totalClicks, writes a Visit row, then 302-redirects
5. Dashboard & Analytics read those Visit rows to draw charts
```

---

## 5. API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create account, send OTP |
| POST | `/api/auth/verify-otp` | Verify signup OTP |
| POST | `/api/auth/login` | Log in → JWT + refresh token |
| POST | `/api/auth/resend-otp` | Resend OTP (60s cooldown) |
| POST | `/api/auth/forgot-password` | Send reset OTP |
| POST | `/api/auth/verify-reset-otp` | Verify reset OTP → reset ticket |
| POST | `/api/auth/reset-password` | Set new password |
| POST | `/api/auth/refresh` | New access token |
| POST | `/api/auth/logout` | Revoke refresh token |
| POST | `/api/url/create` | Create short URL |
| POST | `/api/url/bulk` | Create up to 25 URLs |
| PATCH | `/api/url/:id` | Edit destination / expiry / status |
| DELETE | `/api/url/:id` | Soft delete |
| GET | `/api/url/dashboard` | Stats, trend, breakdowns, links |
| GET | `/api/url/analytics/:shortCode` | Owner-only analytics |
| GET | `/api/url/public/:shortCode` | Public stats |
| GET | `/:shortCode` | Redirect + record the visit |

---

## 6. Sample Output (logs, images, DB entries)

**Server logs** (signup → verify → click):

```text
Server running on port 5000
[mailer] SMTP ready via smtp.gmail.com:587 as youraddress@gmail.com
[mailer] Sent REGISTER code to user@gmail.com
POST /api/auth/register   201
POST /api/auth/verify-otp 200
GET  /Ab3xY9q             302   <- short link clicked = a recorded "click"
```

**Database — `User` table** (passwords are bcrypt-hashed, never plaintext):

```text
#11  verified=true   bala@gmail.com   (bala)
#12  verified=false  suba@gmail.com   (suba)
```

**Database — `Visit` table** (one row per click — the analytics source of truth):

```text
id  urlId  browser  device   os       country  visitedAt
1   7      Chrome   Desktop  Windows  IN       2026-06-04T09:12:33Z
```

## 7. Demo Video

▶️ **Watch the demo:** <https://youtu.be/yE32suFqkPk>

> Required by the hackathon — a submission without a video is not reviewed.
>
> Suggested flow: signup → OTP email → login → create a short link (alias/expiry) →
> click it (redirect) → dashboard stats & charts → per-link analytics → public stats → delete.

---

This project is a part of a hackathon run by https://katomaran.com
