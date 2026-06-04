# 🎓 Interview Guide — URL Shortener (end-to-end explanation)

A senior-level walkthrough of how every part of this project works, with the **why** behind each decision. File references point to the real code.

---

## 1. The Big Picture — every request

```
Browser (React)
   │  Axios adds JWT → Authorization: Bearer <token>
   ▼
Express API ──► Middleware chain (Helmet → CORS → JSON parse → rate-limit → reCAPTCHA → JWT auth)
   │
   ▼
Controller (thin) ──► Service (business logic) ──► Prisma ORM ──► PostgreSQL
   │
   ▼
Response (ok/fail JSON) ──► React updates UI (toast / table / charts)
```

**Soundbite:** *3-tier REST architecture — React SPA, an Express API split routes → controllers → services, and PostgreSQL via Prisma. Controllers stay thin; business logic lives in services so it's testable and reusable.*

---

## 2. Authentication

### 2a. Signup (`server/src/services/auth.service.js` → `registerUser`)
1. **Validate** name, email (`validator.isEmail`), and strong password:
   `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$` — `(?=...)` lookaheads each assert a character class exists; `.{8,}` enforces length.
2. **Uniqueness:** verified email → block; unverified → allow re-register.
3. **Hash** with bcrypt, 12 rounds: `bcrypt.hash(password, 12)`.
   - bcrypt is **slow + salted** (2¹²=4096 iterations); salt stored in the hash → same password ≠ same hash (beats rainbow tables).
   - **Not SHA-256** because SHA is fast → easy to brute-force. Passwords need slow hashing.
4. **Issue + email an OTP.**

### 2b. OTP
- Generate: `Math.floor(100000 + Math.random()*900000)` → 6 digits.
- Store in `UserOtp`: `expiresAt = now + 5m`, `attemptCount = 0`, `isUsed = false`.
- Validate (`consumeOtp`): expired → reject · `attemptCount ≥ 5` → reject · wrong → `attemptCount++` · correct → `isUsed = true` (single-use).
- Resend cooldown: reject if last code < 60s old (anti-spam).

**Soundbite:** *The OTP lives in the DB as the source of truth; the email is a copy. The server validates with expiry, attempt-limiting, and single-use — so it can't be brute-forced or replayed.*

### 2c. Email (`server/src/config/mailer.js`)
- **Nodemailer** over **SMTP** (`smtp.gmail.com:587`).
- A `transporter` = reusable authenticated connection; authenticated with a Gmail **app password** (Google blocks normal passwords for apps).
- Port 587 = STARTTLS (upgrade to TLS); 465 = implicit TLS.
- If sending fails it logs to console instead of crashing signup.

### 2d. Login (`auth.service.js` → `loginUser`) — defenses in order
1. **Rate limiting** (`rateLimiter.middleware.js`, `express-rate-limit`): login 10 / 15min per IP → over limit = `429`. Per-IP.
2. **reCAPTCHA** (`recaptcha.middleware.js`): frontend gets a token from Google's widget; backend verifies it at `google.com/recaptcha/api/siteverify`. Bot check.
3. **Brute-force lockout** (per account): each wrong password `failedLoginAttempts++`; at 5 → `lockedUntil = now + 15m`; success resets it.
   - *Why both rate-limit AND lockout?* Rate-limit = per-IP (one spamming machine). Lockout = per-account (distributed attack from many IPs). Defense in depth.
4. **Password check:** `bcrypt.compare(plaintext, hash)` (one-way; you never decrypt).
5. **State checks:** must be `ACTIVE` + `isVerified`.
6. **Issue tokens.**

### 2e. JWT — two tokens
```
accessToken  = jwt.sign({userId,email}, SECRET, {expiresIn:"15m"})  // stateless, short
refreshToken = crypto.randomBytes(48).toString("hex")               // 7d, random
```
- JWT = `header.payload.signature`; signature = HMAC-SHA256 over header+payload with `JWT_SECRET`. Readable but **unforgeable** without the secret.
- **Access (15m):** sent every request; short life limits damage if stolen; verified by signature only (no DB hit).
- **Refresh (7d):** only mints new access tokens; stored **SHA-256 hashed** in `RefreshToken`; **revocable** (logout / password reset set `revokedAt`).

**Soundbite:** *Access tokens are stateless + short-lived; refresh tokens are long-lived, hashed at rest, and revocable so we keep server-side session control.*

### 2f. Protected routes
- Server `auth.middleware.js`: reads `Bearer`, `jwt.verify`, attaches `req.user`; bad token → `401`.
- Client `ProtectedRoute.jsx`: no token → redirect to login.
- **Ownership:** every URL query filters `userId: req.user.userId`.

---

## 3. URL Shortening

### Generation (`urlHelpers.js` → `randomCode`, `url.service.js` → `makeShortCode`)
- **Base62** (0-9 a-z A-Z), 7 chars → 62⁷ ≈ 3.5 trillion combos; short + URL-safe.
- Collision-safe: generate → check DB → retry (≤8×); `shortCode @unique` is the final guarantee.
- Custom alias: validate `^[a-zA-Z0-9_-]{3,32}$`, check uniqueness.
- **Why not auto-increment IDs?** Sequential = guessable + leaks volume. Random base62 avoids enumeration.

### Validation
`validator.isURL(value, {require_protocol:true, protocols:['http','https']})` — backend validation is mandatory; never trust the client.

### Redirect (`redirect.controller.js`)
`GET /:shortCode` → `res.redirect(originalUrl)`. `404` not found, `410 Gone` expired/inactive. Server-side redirect.

---

## 4. Click counting & analytics

**A click = a request to `GET /:shortCode`** (the only path to a link). In `url.service.js → redirectUrl`:
```js
prisma.url.update({ data: { totalClicks: { increment: 1 }, lastVisitedAt: new Date() } });
prisma.visit.create({ data: { urlId, ipAddress, browser, device, os, country, referrer, userAgent } });
```
- `{ increment: 1 }` → SQL `totalClicks = totalClicks + 1`, **atomic** (no lost counts on concurrent clicks).
- One timestamped `Visit` row per click = the history the brief requires.

### Device/browser/OS (`urlHelpers.js → parseClient`)
Parsed from the **User-Agent header** by string matching (`chrome/`→Chrome, `windows`→Windows, `mobile`→Mobile). **Country** from `cf-ipcountry` header (Cloudflare).

### Charts (`client/src/components/charts.jsx`)
**Recharts** — `AreaChart` (trend), `PieChart` (device/browser donuts), `BarChart` (top links); SVG-based, declarative, responsive. Aggregation done in JS (group-by-day, tally distributions). Documented in README.

---

## 5. Frontend
- **React + React Router** SPA (`AppRoutes.jsx`).
- **Axios** (`api.js`) — request interceptor auto-attaches the JWT to every call; `baseURL` from env (`VITE_API_URL`).
- UX states: skeletons/spinner (loading), toasts (`toast.js`) for success/error, inline validation (live password checklist).

---

## 6. Database — PostgreSQL + Prisma
- `schema.prisma` = single source of truth: 6 tables (`User`, `UserOtp`, `Url`, `Visit`, `RefreshToken`, `AuditLog`) + relations, indexes, constraints; generates a typed client.
- **SQL injection prevention:** Prisma sends **parameterized queries** — SQL structure (`WHERE email = $1`) is sent separately from the value, so input is always treated as data, never executable SQL. No string concatenation.
- **Indexes** (`@@index([userId,status])`, `@@index([shortCode])`) speed up dashboard + redirect lookups.
- **Soft delete:** `status='DELETED'` + `deletedAt`; queries filter `deletedAt: null` → history/analytics preserved.
- **Migrations:** schema describes desired shape; `prisma migrate` runs SQL to alter the real DB.

---

## 7. Security summary
bcrypt(12) · JWT access(15m)+refresh(7d, hashed, revocable) · per-IP rate limit · per-account lockout · reCAPTCHA · OTP expiry/attempt/cooldown · Helmet · CORS allow-list · server-side validation · parameterized queries (no SQLi) · owner-scoped queries · secrets in git-ignored `.env` · centralized error handler.

---

## 8. Likely interview Q&A
- **Unique short codes?** Random base62 + DB pre-check + `@unique` backstop.
- **Concurrent clicks?** Atomic DB increment — no lost updates.
- **JWT vs sessions?** Stateless + scalable; refresh token restores revocability.
- **Stop SQL injection?** Prisma parameterized queries.
- **Where are secrets?** Passwords bcrypt-hashed, refresh tokens SHA-256 hashed, OTPs single-use in DB, config in git-ignored `.env`.
- **How is a click counted?** Every redirect increments `totalClicks` + writes a timestamped `Visit`.
