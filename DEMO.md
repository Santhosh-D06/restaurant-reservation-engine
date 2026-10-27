# Live demo guide

## Before the demo (5 minutes)
1. Start MongoDB (Windows service should already be running).
2. From the project folder: `npm run seed` (resets to clean sample data), then `npm run dev`.
3. Open http://localhost:5173. Optional: run `npm run smoke` in a second cmd window to confirm the API passes.
4. Use a normal (not incognito) window with the browser zoomed to ~110% so the audience can read it.

## Test accounts (sample data only)
| Role | Email | Password |
|---|---|---|
| Customer | customer1@example.com (also customer2@..., customer3@...) | the value of `SEED_DEMO_PASSWORD` in `backend/.env` |
| Admin | the value of `SEED_ADMIN_EMAIL` in `backend/.env` | the value of `SEED_ADMIN_PASSWORD` in `backend/.env` |

Passwords are never stored in the code. Write your chosen ones on paper for the demo, not in a file that gets shared.

## Script (about 8-10 minutes)
| # | Do this | Say this |
|---|---|---|
| 1 | Open the home page | "TableEase lets customers find restaurants, reserve tables and order food online. It is built on MongoDB, Express, React and Node." |
| 2 | Register a new customer (or log in as customer1) | "Passwords are hashed with bcrypt. The server returns a JWT that React sends with every request." |
| 3 | Restaurants: search "italian", use the cuisine filter | "Search and filters run on the Express API against MongoDB." |
| 4 | Open a restaurant: hours, tables, menu | "This data comes from the Restaurant, Table and Menu collections." |
| 5 | Reserve: pick tomorrow, a time, 2 guests, choose a Free table, submit | "The page checks live availability. Booked or too-small tables are disabled." |
| 6 | Book the SAME table/time again (use a second browser window logged in as customer2) | "Double booking is blocked twice: an application check and a unique database index." You should see an error message. |
| 7 | My Reservations: modify one, cancel one | "Cancelling frees the slot again." |
| 8 | Restaurant menu: add 2-3 items, change quantities, remove one, open Cart | "Totals are calculated in the cart, and again on the server from database prices so they cannot be tampered with." |
| 9 | Place the order (pickup) | "Payment is simulated for the demo; no real payment is processed." |
| 10 | Order details page | "This tracker shows the current status and refreshes automatically." Leave it open. |
| 11 | Logout, then go to /admin/login and log in as admin | "Admins have a separate login and permissions. A customer calling admin APIs gets 403." |
| 12 | Admin dashboard, Reservations: approve one; Orders: set status to Confirmed, then Preparing | "The customer's tracker updates." Switch to the customer window to show it. |
| 13 | Admin: Restaurants (edit one), Menus (change a price), Tables (disable one), Customers | "Admins can manage all the data." |

## How the parts work together (30 seconds)
React runs in the browser and shows the pages. When you click, it sends a request with Axios to the Express API on Node.js, with the JWT in the header. Express checks the token and role, validates the input, and uses Mongoose to read or write MongoDB. The JSON result goes back to React, which redraws the page.

## If something goes wrong live
- "Route not found" or blank lists: backend not running or old process. `taskkill /F /IM node.exe`, then `npm run dev`.
- Empty restaurant list: run `npm run seed`.
- MongoDB error at startup: start the MongoDB service (`net start MongoDB` in an admin cmd) or check `MONGO_URI`.
