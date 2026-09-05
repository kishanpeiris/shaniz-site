# Shani'z — Herbal Hair & Skin Care

React + Vite + Tailwind storefront, wired to the `shaniz-api` backend
(sold separately in this same handoff — you need both). The catalog,
basket checkout, service booking, customer accounts, and admin panel all
hit a real API and a real Postgres database.

## Recent audit (security + correctness pass)

This project went through a full audit alongside `shaniz-api` — not just
a code review, but real end-to-end testing with an actual Postgres
database, a real running backend, and a real headless browser clicking
through the app. (An earlier note in this README said a headless-browser
click-through wasn't possible in the sandbox this was built in — that's
since been resolved, and this pass used one throughout.) Real bugs found
and fixed:

- **Admin had no way to set service blackout dates ("days off").** The
  backend only supported creating one via direct API call — no way to
  view or remove it, and the admin Services page had no UI for it at all,
  despite the project spec requiring it. Built out the full "Blackout
  dates (days off)" section on the admin Services page — add a date +
  optional reason, see the list, remove one — and verified it live
  against a real database (added "Christmas Day," saw it appear, removed
  it, confirmed the slot became bookable again).
- **"Invalid Date" bug**, caught immediately after building the fix
  above by testing against a real database instead of assuming the data
  shape: Postgres `DATE` columns come back over the API as full ISO
  datetime strings (e.g. `"2026-12-25T00:00:00.000Z"`), not plain
  `"2026-12-25"` — a naive `new Date(...)` on that string doubled the time
  portion and produced "Invalid Date." Fixed with a proper, timezone-safe
  date-formatting helper (`src/lib/date.js`), now shared across the admin
  Services, Bookings, and the customer Account page.
- **Admin Bookings table showed raw ISO timestamps** instead of a
  readable date, for the same underlying reason — fixed the same way.
- **React anti-pattern in `LoginPage`** — it called `navigate()` directly
  in the component body (to redirect an already-logged-in user away from
  the login page) instead of inside a `useEffect`. React explicitly warns
  against updating router state during another component's render; fixed
  by moving the redirect into an effect, and confirmed the console
  warning is gone.
- **Pre-order estimated-arrival date was invisible to customers** after
  checkout — it was only ever included in the confirmation email. Added
  it to both the Thank You page and the Account page's order history, so
  customers can see it without needing the email.

Also delivered this pass (not bug fixes, but real feature work, all
verified against the live backend): Shop page filtering (All/Products/
Services), sort-by-popularity (driven by real `units_sold` computed
server-side from paid orders), and pagination; a full-page background
photo on the Thank You page with a scrim tuned for text contrast; and the
homepage hero video now plays its "leaves falling" intro once per real
page load and then loops only the settled tail (rain continuing, leaves
already resting) instead of restarting the whole clip and making the
leaves appear to fly away again.

## What's real vs. still placeholder

**Real, working, backed by the database:**
- Product/service catalog (`useCatalog` hook fetches `/api/products` and `/api/services`)
- Basket checkout — `POST /api/orders`; the backend re-checks stock and
  recomputes the price from the DB, decrements stock, sends a real order
  confirmation email, and starts checkout with your selected payment
  gateway (Koko/IntPay/Dialog Genie — a sandbox mock link until you add
  real gateway credentials on the backend)
- Booking — `BookingWidget` fetches real open slots from
  `/api/bookings/services/:id/slots`, creates a real booking, rejects
  double-bookings (while correctly allowing a slot to be rebooked after a
  cancellation), and sends a real confirmation email
- **Customer accounts** (`/register`, `/login`, `/forgot-password`,
  `/reset-password`, `/account`) — real registration, login, and password
  reset (a real reset-link email is sent); the account page shows profile
  editing, password change, saved addresses (used to prefill checkout),
  saved payment method tokens, order history (including pre-order ETA
  dates), and upcoming bookings, all from the real backend. Logged-in
  checkout skips the guest email field and lets you pick a saved address.
- Product/service **images** — the admin panel uploads directly to the
  backend (`POST /api/uploads`), which re-encodes and validates every
  file before storing it (Cloudinary in production, local disk in dev).
  Hover-loop GIFs keep their animation.
- **Admin panel at `/admin`** (sign in at `/login`) — dashboard,
  product/stock management (with photo + hover-GIF upload, availability/
  pre-order controls), service & availability-window management
  (including weekly windows and blackout dates, with photo upload),
  bookings calendar, order status updates, customer enable/disable, admin
  account management (superadmin-only), audit/activity log viewer,
  business-info settings (phone/email/address/Facebook — shown live on
  the Visit section and footer), and maintenance mode + outage
  scheduling. Every screen calls the real backend; nothing here is
  mocked. Route access is enforced both by `RequireRole`/`RequireAuth` in
  the frontend (redirects to `/login`) and by the backend's own RBAC (so
  a customer can't reach these API routes even by guessing the URL).
- **Shop page** — filter by All/Products/Services, sort (popularity,
  newest, price, name), and pagination, all client-side over the real
  catalog.

**Still placeholder (by design — later spec phases):**
- Orders only reach `"paid"` once a real gateway webhook fires — until
  you have real Koko/IntPay/Dialog Genie credentials, the "Continue to
  payment" link after checkout goes to a sandbox mock URL and the order
  stays `"pending"`.
- Contact form is still a placeholder (unchanged from earlier notes).

## Run it locally

You need both projects running:

```bash
# Terminal 1 — backend (see shaniz-api/README.md for its own setup)
cd shaniz-api
npm install
npm run db:migrate
npm run db:seed-superadmin
npm run db:seed-catalog   # <-- adds the real Aangraa/Shani'z catalog
npm run dev               # listens on :4000

# Terminal 2 — frontend
cd shaniz-site
cp .env.example .env      # VITE_API_URL=http://localhost:4000 by default
npm install
npm run dev                # listens on :5173
```

Open `http://localhost:5173`. Create an account at `/register`, add
something to the basket, hit Checkout — you'll get back a real order ID
sitting in Postgres and a confirmation email (logged to the backend's
console unless you've set up Resend). Click "Reserve a Slot" on the scalp
ritual card — the times shown come from the backend's actual availability
computation, and a booking confirmation email follows the same way.

## How this was tested

Every feature in this app has been tested against a real running instance
of both the backend and this frontend — not just read for correctness.
That includes a full real browser session (via an automated headless
browser) clicking through: registering an account, adding a saved
address, changing a password, requesting and completing a password reset
with the real emailed token, logging back in with the new password,
booking a slot while signed in, cancelling it and confirming the same
slot can be booked again, placing a guest order, paying it in the sandbox
flow, and confirming it shows up correctly in the admin Dashboard and
Orders page with accurate revenue and payment-gateway numbers. The full
admin panel (Dashboard, Products, Services, Bookings, Orders, Customers,
Admins, Logs, Settings, Maintenance) was clicked through against real
data with browser console errors monitored throughout.

## API client (`src/api/client.js`)

Every request needs `credentials: 'include'` so the session cookie is
sent, and every non-GET request needs the header
`X-Requested-With: shaniz-frontend` — the backend's CSRF middleware
rejects mutating requests without it. `apiGet` / `apiPost` / `apiPut` /
`apiDelete` handle both for you; `apiUpload` does the same for file
uploads (uses `FormData`, so no `Content-Type` header — the browser sets
the multipart boundary itself). Use these instead of raw `fetch()` calls
anywhere you add new API calls.

## Going live — step by step

This frontend and `shaniz-api` deploy separately but depend on each
other. If you haven't already, start with `shaniz-api/README.md`'s
"Going live" section — it covers creating all the accounts you'll need
(GitHub, Neon/Supabase, Render/Railway, Cloudinary, Resend) and deploying
the backend first. Come back here once the backend is live.

### 1. Deploy to Vercel

1. Push this repo to GitHub if you haven't already (see
   `shaniz-api/README.md` Step 2 for the git commands — same idea here).
2. In Vercel: **Add New → Project**, import this repo. It auto-detects
   the Vite framework preset — no build settings to change.
3. Add one environment variable: `VITE_API_URL` = your deployed backend's
   URL (e.g. `https://shaniz-api.onrender.com`).
4. Deploy. Vercel gives you a URL like `https://shaniz-site.vercel.app` —
   the site is fully live there already, including checkout (sandbox
   mode), bookings, and the admin panel.
5. **Important:** go back to the backend's environment variables and set
   `FRONTEND_ORIGIN` to this exact Vercel URL, then redeploy the backend.
   Until you do this, the browser's CORS check will block every request
   from this frontend to the backend.

### 2. Point your custom domain at it

1. In Vercel: **Project → Settings → Domains**, add your domain (e.g.
   `shaniz.lk`). Vercel shows you the DNS records to add.
2. At your domain registrar, add those records (typically an `A` record
   for the bare domain and a `CNAME` for `www`).
3. Once DNS propagates, your custom domain serves this site, with HTTPS
   provisioned automatically by Vercel.
4. **Update `FRONTEND_ORIGIN` on the backend again** — this time to your
   real domain (e.g. `https://shaniz.lk`) instead of the `.vercel.app`
   one — and redeploy the backend once more.

### 3. Verify before announcing launch

- [ ] Load the site on your real domain, not the `.vercel.app` one
- [ ] Complete one full test purchase (sandbox mode is fine pre-payments)
- [ ] Complete one full test booking, then cancel it and confirm the slot
      opens back up
- [ ] Log into `/admin` with your superadmin account and confirm the
      Dashboard shows real numbers
- [ ] Check the browser console for errors on the home page, shop page,
      checkout, and admin dashboard
- [ ] Confirm images you upload through the admin panel actually persist
      after a few minutes (this only works reliably once Cloudinary is
      configured on the backend — see `shaniz-api/README.md` Step 6)

### 4. After that

- **Payments** — once you have Koko/IntPay/Dialog Genie sandbox
  credentials (set them in `shaniz-api`'s environment variables), the
  backend's checkout endpoint returns a real redirect URL instead of the
  sandbox mock one, and "Continue to payment" here actually sends the
  customer to pay. No frontend changes needed for this.
- **PDF invoices** — the invoice *email* is real, but it doesn't yet
  attach an actual PDF (see `shaniz-api/README.md`).
- Every time you push a small fix or content change to GitHub, both
  Vercel and your backend host auto-deploy it with zero downtime — a
  failed build never goes live, the previous version just keeps running.
  Reserve Maintenance Mode (toggle in the admin panel) for database
  migrations or anything that could interrupt checkout mid-transaction.
