// End-to-end API smoke test. Run AFTER `npm run seed` with the backend running:
//   npm run smoke            (from project root)
// Needs Node 18+ (built-in fetch). Uses backend/.env for the admin login.
// Writes a real, timestamped result file to docs/smoke-test-results.txt.
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const BASE = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api`;
const results = [];
let failures = 0;

const check = (name, ok, detail = '') => {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${!ok && detail ? `  -> ${detail}` : ''}`);
  if (!ok) failures += 1;
  console.log(results[results.length - 1]);
};

const call = async (method, url, { token, body } = {}) => {
  const res = await fetch(BASE + url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = {};
  try { data = await res.json(); } catch { /* empty body */ }
  return { status: res.status, data };
};

const dateFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const run = async () => {
  const stamp = Date.now();
  const pw = `Smoke${stamp}!`;
  const mk = (n) => ({ name: `Smoke Tester ${n}`, email: `smoke.${n}.${stamp}@example.com`, password: pw });

  // ---- server + auth ----
  let r = await call('GET', '/health').catch(() => null);
  if (!r || r.status !== 200) {
    console.log(`\nAPI not reachable at ${BASE}. Start it with "npm run dev" first.`);
    process.exit(2);
  }
  check('Health endpoint responds', r.data.success === true);

  const A = mk('A'); const B = mk('B');
  r = await call('POST', '/auth/register', { body: A });
  check('Register customer A returns 201 + token, role customer', r.status === 201 && !!r.data.token && r.data.user?.role === 'customer', JSON.stringify(r.data));
  const tokA = r.data.token;
  r = await call('POST', '/auth/register', { body: B });
  const tokB = r.data.token;
  check('Register customer B', r.status === 201 && !!tokB);
  r = await call('POST', '/auth/register', { body: A });
  check('Duplicate email rejected (409)', r.status === 409, `status ${r.status}`);
  r = await call('POST', '/auth/register', { body: { ...mk('C'), password: '123' } });
  check('Short password rejected (400)', r.status === 400, `status ${r.status}`);
  r = await call('POST', '/auth/register', { body: { ...mk('D'), role: 'admin' } });
  check('Cannot self-register as admin (role forced to customer)', r.status === 201 && r.data.user?.role === 'customer');
  r = await call('POST', '/auth/login', { body: { email: A.email, password: pw } });
  check('Login with correct password', r.status === 200 && !!r.data.token);
  r = await call('POST', '/auth/login', { body: { email: A.email, password: 'wrong-password' } });
  check('Login with wrong password rejected (401)', r.status === 401);
  r = await call('GET', '/auth/me', { token: tokA });
  check('GET /auth/me returns the user without password', r.status === 200 && r.data.user?.email === A.email && !('password' in r.data.user));
  r = await call('GET', '/auth/me');
  check('Protected route without token -> 401', r.status === 401);

  // ---- permissions ----
  r = await call('GET', '/admin/stats', { token: tokA });
  check('Customer blocked from admin stats (403)', r.status === 403);
  r = await call('POST', '/restaurants', { token: tokA, body: { name: 'X', cuisine: 'X', city: 'X', address: 'X' } });
  check('Customer cannot create restaurant (403)', r.status === 403);

  // ---- browsing ----
  r = await call('GET', '/restaurants');
  const restaurants = r.data.restaurants || [];
  check('Restaurants load from MongoDB (seeded)', r.status === 200 && restaurants.length > 0, 'no restaurants - run "npm run seed"');
  if (!restaurants.length) return;
  const rest = restaurants[0];
  r = await call('GET', `/restaurants?q=${encodeURIComponent(rest.cuisine)}`);
  check('Search by cuisine finds the restaurant', r.status === 200 && r.data.restaurants.some((x) => x._id === rest._id));
  r = await call('GET', '/restaurants?q=zzzz-no-such-place');
  check('Search with no match returns empty list', r.status === 200 && r.data.count === 0);
  r = await call('GET', `/restaurants?city=${encodeURIComponent(rest.city)}&cuisine=${encodeURIComponent(rest.cuisine)}`);
  check('City + cuisine filter works', r.status === 200 && r.data.count >= 1);
  r = await call('GET', `/restaurants/${rest._id}`);
  check('Restaurant details', r.status === 200 && r.data.restaurant?.name === rest.name);
  r = await call('GET', `/restaurants/${rest._id}/menu`);
  const menu = r.data.items || [];
  check('Menu loads', r.status === 200 && menu.length > 0);
  r = await call('GET', `/restaurants/${rest._id}/tables`);
  const tables = (r.data.tables || []).filter((t) => t.isAvailable && t.capacity >= 2);
  check('Tables load', r.status === 200 && tables.length >= 2);
  r = await call('GET', `/restaurants/${rest._id}/availability`);
  const slots = r.data.slots || [];
  check('Availability returns hourly slots', r.status === 200 && slots.length > 0);

  // ---- reservations & double booking ----
  const date = dateFromNow(20 + Math.floor(Math.random() * 30));
  const slot = slots[0];
  const [t1, t2] = tables;
  const book = (token, table, extra = {}) =>
    call('POST', '/reservations', { token, body: { restaurant: rest._id, table: table._id, date, timeSlot: slot, guests: 2, ...extra } });

  r = await book(tokA, t1);
  check('Customer A books a table (201, pending)', r.status === 201 && r.data.reservation?.status === 'pending', JSON.stringify(r.data));
  const resA = r.data.reservation;
  r = await book(tokB, t1);
  check('DOUBLE BOOKING: same table/date/time by B rejected (409)', r.status === 409, `status ${r.status} ${JSON.stringify(r.data)}`);
  r = await call('GET', `/restaurants/${rest._id}/availability?date=${date}&timeSlot=${slot}&guests=2`);
  const t1info = (r.data.tables || []).find((t) => t._id === t1._id);
  check('Availability shows the table as booked', t1info?.booked === true);
  r = await book(tokB, t2);
  check('Different table, same slot is allowed', r.status === 201, JSON.stringify(r.data));
  const resB = r.data.reservation;
  r = await book(tokB, t1, { timeSlot: slots[1] || slots[0], date: dateFromNow(-1) });
  check('Past date rejected (400)', r.status === 400);
  r = await book(tokB, t1, { guests: 99 });
  check('Too many guests rejected (400)', r.status === 400);
  r = await book(tokB, t1, { timeSlot: '03:00' });
  check('Time outside opening hours rejected (400)', r.status === 400);
  r = await call('GET', `/reservations/${resA._id}`, { token: tokB });
  check("Customer cannot view another customer's reservation (403)", r.status === 403);
  r = await call('PATCH', `/reservations/${resA._id}/cancel`, { token: tokB });
  check("Customer cannot cancel another customer's reservation (403)", r.status === 403);
  r = await call('GET', '/reservations/my', { token: tokA });
  check('My reservations lists only own bookings', r.status === 200 && r.data.reservations.length === 1);
  r = await call('PUT', `/reservations/${resB._id}`, { token: tokB, body: { timeSlot: slots[1] || slot, table: t2._id } });
  check('Modify own reservation works', r.status === 200 && (slots.length < 2 || r.data.reservation.timeSlot === slots[1]), JSON.stringify(r.data));
  r = await call('PATCH', `/reservations/${resA._id}/cancel`, { token: tokA });
  check('Customer A cancels own reservation', r.status === 200 && r.data.reservation.status === 'cancelled');
  r = await book(tokB, t1);
  check('Cancelled slot can be booked again', r.status === 201, JSON.stringify(r.data));
  const resB2 = r.data.reservation;

  // ---- cart -> order ----
  const item1 = menu.find((m) => m.isAvailable);
  const item2 = menu.find((m) => m.isAvailable && m._id !== item1._id);
  r = await call('POST', '/orders', { token: tokA, body: { restaurant: rest._id, items: [{ menuItem: item1._id, quantity: 2 }, { menuItem: item2._id, quantity: 1 }] } });
  const expected = item1.price * 2 + item2.price;
  check('Order total is calculated on the server from DB prices', r.status === 201 && r.data.order?.total === expected, JSON.stringify(r.data));
  const order = r.data.order;
  check('New order status is "placed" with simulated payment', order?.status === 'placed' && order?.paymentStatus === 'simulated');
  r = await call('POST', '/orders', { token: tokA, body: { restaurant: rest._id, items: [] } });
  check('Empty order rejected (400)', r.status === 400);
  const other = restaurants.find((x) => x._id !== rest._id);
  if (other) {
    const om = (await call('GET', `/restaurants/${other._id}/menu`)).data.items?.[0];
    r = await call('POST', '/orders', { token: tokA, body: { restaurant: rest._id, items: [{ menuItem: om._id, quantity: 1 }] } });
    check("Item from another restaurant's menu rejected (400)", r.status === 400);
  }
  r = await call('POST', '/orders', { token: tokA, body: { restaurant: rest._id, orderType: 'delivery', items: [{ menuItem: item1._id, quantity: 1 }] } });
  check('Delivery order without address rejected (400)', r.status === 400);
  r = await call('GET', '/orders/my', { token: tokA });
  check('Order history lists the order', r.status === 200 && r.data.orders.some((o) => o._id === order._id));
  r = await call('GET', `/orders/${order._id}`, { token: tokA });
  check('Order details (own)', r.status === 200 && r.data.order.items.length === 2);
  r = await call('GET', `/orders/${order._id}`, { token: tokB });
  check("Customer cannot view another customer's order (403)", r.status === 403);
  r = await call('PATCH', `/orders/${order._id}/status`, { token: tokA, body: { status: 'delivered' } });
  check('Customer cannot change order status (403)', r.status === 403);

  // ---- admin ----
  const { SEED_ADMIN_EMAIL: ae, SEED_ADMIN_PASSWORD: ap } = process.env;
  if (!ae || !ap) {
    check('Admin tests skipped (SEED_ADMIN_* missing in backend/.env)', false, 'set them and re-run');
  } else {
    r = await call('POST', '/auth/login', { body: { email: ae, password: ap } });
    check('Admin login works and role is admin', r.status === 200 && r.data.user?.role === 'admin', 'run "npm run seed" first / check .env');
    const adm = r.data.token;
    if (adm) {
      r = await call('GET', '/admin/stats', { token: adm });
      check('Admin stats returned', r.status === 200 && r.data.stats.restaurants >= 1 && typeof r.data.stats.orderValue === 'number');
      r = await call('GET', '/admin/customers', { token: adm });
      check('Admin customer list includes the test customers', r.status === 200 && r.data.customers.some((c) => c.email === A.email));
      r = await call('GET', '/reservations', { token: adm });
      check('Admin lists all reservations', r.status === 200 && r.data.reservations.length >= 2);
      r = await call('PATCH', `/reservations/${resB2._id}/status`, { token: adm, body: { status: 'confirmed' } });
      check('Admin approves a reservation', r.status === 200 && r.data.reservation.status === 'confirmed');
      r = await call('PATCH', `/reservations/${resB2._id}/status`, { token: tokB, body: { status: 'confirmed' } });
      check('Customer cannot approve reservations (403)', r.status === 403);
      r = await call('GET', '/orders', { token: adm });
      check('Admin lists all orders', r.status === 200 && r.data.orders.some((o) => o._id === order._id));
      r = await call('PATCH', `/orders/${order._id}/status`, { token: adm, body: { status: 'confirmed' } });
      check('Admin updates order status -> confirmed', r.status === 200 && r.data.order.status === 'confirmed');
      r = await call('GET', `/orders/${order._id}`, { token: tokA });
      check('Customer sees the new status (tracking)', r.status === 200 && r.data.order.status === 'confirmed');
      r = await call('PATCH', `/orders/${order._id}/cancel`, { token: tokA });
      check('Customer cannot cancel after confirmation (400)', r.status === 400);
      r = await call('PATCH', `/orders/${order._id}/status`, { token: adm, body: { status: 'delivered' } });
      check('Admin marks order delivered', r.status === 200 && r.data.order.status === 'delivered');
      r = await call('PATCH', `/orders/${order._id}/status`, { token: adm, body: { status: 'preparing' } });
      check('Delivered order cannot be changed (400)', r.status === 400);

      // restaurant / table / menu CRUD (creates and removes its own restaurant)
      r = await call('POST', '/restaurants', { token: adm, body: { name: `Smoke Cafe ${stamp}`, cuisine: 'Test', city: 'Chennai', address: '1 Test Street' } });
      check('Admin creates a restaurant', r.status === 201);
      const rid = r.data.restaurant?._id;
      if (rid) {
        r = await call('PUT', `/restaurants/${rid}`, { token: adm, body: { city: 'Madurai' } });
        check('Admin edits a restaurant', r.status === 200 && r.data.restaurant.city === 'Madurai');
        r = await call('POST', '/tables', { token: adm, body: { restaurant: rid, tableNumber: 'S1', capacity: 4 } });
        check('Admin adds a table', r.status === 201);
        r = await call('POST', '/tables', { token: adm, body: { restaurant: rid, tableNumber: 'S1', capacity: 2 } });
        check('Duplicate table number rejected (409)', r.status === 409, `status ${r.status}`);
        const tid = (await call('GET', `/restaurants/${rid}/tables`)).data.tables?.[0]?._id;
        r = await call('PUT', `/tables/${tid}`, { token: adm, body: { isAvailable: false } });
        check('Admin disables a table', r.status === 200 && r.data.table.isAvailable === false);
        r = await call('POST', '/menus', { token: adm, body: { restaurant: rid, name: 'Test Dish', category: 'Mains', price: 99 } });
        check('Admin adds a menu item', r.status === 201);
        const mid = r.data.item?._id;
        r = await call('PUT', `/menus/${mid}`, { token: adm, body: { price: 120 } });
        check('Admin edits menu price', r.status === 200 && r.data.item.price === 120);
        r = await call('POST', '/menus', { token: adm, body: { restaurant: rid, name: 'Bad', category: 'X', price: -5 } });
        check('Negative price rejected (400)', r.status === 400);
        r = await call('DELETE', `/menus/${mid}`, { token: adm });
        check('Admin removes a menu item', r.status === 200);
        r = await call('DELETE', `/restaurants/${rid}`, { token: adm });
        check('Admin deletes the test restaurant', r.status === 200);
        r = await call('GET', `/restaurants/${rid}`);
        check('Deleted restaurant is gone (404)', r.status === 404);
      }
    }
  }

  // cleanup: free the slots the test used
  await call('PATCH', `/reservations/${resB._id}/cancel`, { token: tokB });
  await call('PATCH', `/reservations/${resB2._id}/cancel`, { token: tokB });
};

run()
  .catch((e) => { failures += 1; results.push(`FAIL  Unexpected error: ${e.message}`); console.error(e); })
  .finally(() => {
    const passed = results.filter((x) => x.startsWith('PASS')).length;
    const summary = `\n${passed} passed, ${failures} failed (${results.length} checks) against ${BASE}`;
    console.log(summary);
    const out = `API smoke test - ${new Date().toString()}\n${'-'.repeat(60)}\n${results.join('\n')}\n${summary}\n`;
    try {
      const dir = path.join(__dirname, '..', '..', 'docs');
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'smoke-test-results.txt'), out);
      console.log('Results saved to docs/smoke-test-results.txt');
    } catch { /* ignore */ }
    process.exit(failures ? 1 : 0);
  });
