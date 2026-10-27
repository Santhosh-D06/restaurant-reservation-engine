# Testing record

Only mark an item as passed after you have seen it work.

## 1. Automated API smoke test (real requests to the running backend)
1. Backend running (`npm run dev`) and database seeded (`npm run seed`).
2. Run `npm run smoke` (needs Node 18+).
3. It prints PASS/FAIL per check and saves the real output to `docs/smoke-test-results.txt`.
It creates a few test users, bookings and an order (and one temporary restaurant that it deletes). Running `npm run seed` again resets everything.
It does NOT test the React screens. Do section 2 for that.

## 2. Manual UI checklist (mark Pass / Fail / Notes)
| Area | Check | Result |
|---|---|---|
| Auth | Register new customer, lands on dashboard | |
| Auth | Login wrong password shows error | |
| Auth | Logout, then /my-reservations redirects to login | |
| Auth | Customer opening /admin is redirected away | |
| Browse | Restaurant list shows 4 restaurants | |
| Browse | Search "pizza" or "italian" filters list | |
| Browse | Cuisine and city filters work | |
| Browse | Details page shows hours, tables, menu | |
| Reserve | Book a table, appears in My Reservations as pending | |
| Reserve | Same table/time by another account is refused | |
| Reserve | Modify reservation (time) works | |
| Reserve | Cancel reservation works, slot becomes free | |
| Cart | Add items, +/- quantity, remove item | |
| Cart | Subtotal and total update correctly | |
| Cart | Cart survives page refresh | |
| Order | Place pickup order, opens order page | |
| Order | Delivery order requires an address | |
| Order | Order appears in My Orders and Dashboard | |
| Order | Tracker updates after admin changes status | |
| Admin | Admin login works; customer account is refused at /admin/login | |
| Admin | Dashboard numbers are shown | |
| Admin | Add / edit / delete restaurant | |
| Admin | Add / edit / delete menu item | |
| Admin | Add / disable / delete table | |
| Admin | Approve and cancel reservation | |
| Admin | Update order status | |
| Admin | Customers list shows customers | |
| Layout | Pages usable at phone width (browser dev tools, F12 then device toolbar) | |

## 3. Known limitations
- Payments are simulated only.
- No email/SMS notifications, no real-time push (order page polls every 10 seconds).
- Seed data has no food/restaurant photos (placeholders are shown).
