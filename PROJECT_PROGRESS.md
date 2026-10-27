# PROJECT_PROGRESS

**Current stage:** Stage 5 (testing + demo prep) IN PROGRESS.
**Stopped at:** test tooling and demo docs written; waiting for the results of `npm run smoke` and the manual checklist (TESTING.md) from the laptop. Next: fix whatever fails, then Stage 6 (PPT).

## Verification status (be honest in the review)
- Checked here: `node --check` on all backend files; assert tests of `utils/slots.js`; logic tests of `orderController` and `reservationController` run against STUBBED models (order totals recomputed from DB prices, unavailable/foreign items rejected, delivery address rule, status transitions, double-booking 409, capacity/wrong-table/off-table/bad-slot/past-date rejections); esbuild parse + full bundle check of all 34 frontend files (syntax and named imports OK).
- These stub tests do NOT prove the real MongoDB unique index or the real HTTP/JWT flow work.
- NOT verified: `npm install`, MongoDB connection, server start, any API call, seed script, double-booking prevention, JWT/role checks.
  (Build sandbox has no internet, no MongoDB, so none of this could be run.)

## Written so far
- Stage 1: scaffold, configs, health route, Vite+React placeholder
- Stage 2 backend:
  - Models: User, Restaurant, Menu (one doc per food item), Table, Reservation, Order
  - Auth: register/login/me, bcryptjs hashing, JWT, `protect` + `authorize('admin')` middleware, express-validator, central error handler
  - Double-booking: app-level check + unique partial index on (table, date, timeSlot) where isActive=true; cancelled bookings free the slot
  - Seed: `backend/seed/seed.js` (admin from .env, 3 demo customers, 4 restaurants, 32 tables, menu items, 3 reservations, 3 orders)

- Stage 3 frontend (React Router, Context API, Axios):
  - Pages: Home (search + featured), Login, Register, Restaurants (search/cuisine/city/sort), RestaurantDetails (info, hours, tables, menu by category), Reserve (also used to modify: date/time/guests, live table availability, table picker), MyReservations (view, modify, cancel)
  - Components: Navbar (responsive), ProtectedRoute (login + role), RestaurantCard, Loader, Alert; AuthContext (JWT in localStorage, session restore via /auth/me)
  - Routes: /, /login, /register, /restaurants, /restaurants/:id, /restaurants/:id/reserve, /reservations/:id/edit, /my-reservations, /admin/* (placeholder)
- Stage 4:
  - Backend: Order APIs (server recomputes prices), admin stats + customers APIs
  - Customer: CartContext (localStorage, one restaurant per cart, qty +/-, remove, subtotal/total), Add-to-cart on menu, Cart page (pickup/delivery, DEMO payment), My Orders, Order details with status tracker (auto-refresh 10s) and cancel-while-placed, Dashboard
  - Admin: Admin login, layout, dashboard stats, Restaurants CRUD, Menus CRUD, Tables (add/edit/enable/disable/delete), Reservations (approve/cancel), Orders (update status), Customers list
  - Known gaps: no separate "/menu" page (menu is on the restaurant details page); no order tax/delivery fee; no images in seed data (placeholders shown); admin cannot edit/delete customers; not responsive-tested on a real phone

## API endpoints (Stages 2 and 4)
| Method | Path | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/auth/me | logged in |
| GET | /api/restaurants (?q, cuisine, city, sort) | public |
| GET | /api/restaurants/:id, /:id/menu, /:id/tables | public |
| GET | /api/restaurants/:id/availability?date&timeSlot&guests | public |
| POST/PUT/DELETE | /api/restaurants[/:id] | admin |
| POST/PUT/DELETE | /api/menus[/:id] | admin |
| POST/PUT/DELETE | /api/tables[/:id] | admin |
| POST | /api/reservations | customer |
| GET | /api/reservations/my | customer |
| GET | /api/reservations/:id | owner/admin |
| PUT | /api/reservations/:id (modify) | owner |
| PATCH | /api/reservations/:id/cancel | owner |
| GET | /api/reservations (?status, restaurant, date) | admin |
| PATCH | /api/reservations/:id/status | admin |
| POST | /api/orders | customer |
| GET | /api/orders/my | customer |
| GET | /api/orders/:id | owner/admin |
| PATCH | /api/orders/:id/cancel | owner (only while "placed") |
| GET | /api/orders (?status, restaurant) | admin |
| PATCH | /api/orders/:id/status | admin |
| GET | /api/admin/stats, /api/admin/customers | admin |

## Stage 5 additions
- `npm run smoke` (backend/scripts/smoke-test.js): about 62 real HTTP checks (auth, permissions, search, reservations, double booking, cart totals, orders, admin CRUD/status). Saves real output to docs/smoke-test-results.txt. NOT yet run by me (no DB here); its results must come from your laptop.
- TESTING.md (manual UI checklist to fill in), DEMO.md (credentials sheet, step-by-step script, explanation)
- Null-safety: pages no longer crash if a restaurant/table was deleted after a booking/order was made

## Remaining
- Stage 5: run + test everything on the laptop, fix bugs, demo script and credentials sheet
- Stage 6: PPT from `Combined_Review.pptx` + real screenshots (you must capture them from the running app)

## Commands
- Install: `npm run install:all`
- Run: `npm run dev`
- Seed (wipes DB!): `npm run seed`

## Errors to fix
- FIXED (found in first laptop run): `backend/server.js` never mounted the API routes (my scripted edit silently failed), so every call returned "Route not found". Routes are now mounted; verified by reading the file.
- None recorded yet (nothing has been run). Paste any errors here / into chat.

## Decisions to make
- PPT font: template's own fonts vs Times New Roman 28/20/18pt spec
- Orders are pickup/delivery with simulated ("demo") payment only
