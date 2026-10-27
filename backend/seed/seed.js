// Usage: npm run seed   (from project root or backend/)
// WARNING: deletes ALL existing users, restaurants, menus, tables, reservations and orders.
// Admin email/password and the demo customers' password come from backend/.env (never hard-coded).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const Order = require('../models/Order');

const { MONGO_URI, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_DEMO_PASSWORD } = process.env;

const dayFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const restaurants = [
  {
    name: 'Marina Spice Kitchen', cuisine: 'South Indian', city: 'Chennai', address: '12 Beach Road, Besant Nagar',
    phone: '044-5550-0101', openTime: '08:00', closeTime: '22:00',
    description: 'Traditional South Indian meals, tiffin and filter coffee.',
    menu: [
      ['Starters', 'Medu Vada', 60, true], ['Starters', 'Chicken 65', 180, false],
      ['Mains', 'Masala Dosa', 90, true], ['Mains', 'Chettinad Chicken Curry', 260, false],
      ['Mains', 'Veg Meals (Thali)', 150, true], ['Mains', 'Hyderabadi Veg Biryani', 190, true],
      ['Desserts', 'Payasam', 70, true], ['Drinks', 'Filter Coffee', 40, true],
    ],
  },
  {
    name: 'Bella Trattoria', cuisine: 'Italian', city: 'Chennai', address: '45 Nungambakkam High Road',
    phone: '044-5550-0102', openTime: '12:00', closeTime: '23:00',
    description: 'Wood-fired pizzas and fresh pasta in a cosy setting.',
    menu: [
      ['Starters', 'Garlic Bread', 120, true], ['Starters', 'Bruschetta', 150, true],
      ['Mains', 'Margherita Pizza', 320, true], ['Mains', 'Pepperoni Pizza', 390, false],
      ['Mains', 'Penne Arrabbiata', 280, true], ['Mains', 'Chicken Alfredo', 340, false],
      ['Desserts', 'Tiramisu', 220, true], ['Drinks', 'Iced Lemon Tea', 90, true],
    ],
  },
  {
    name: 'Dragon Wok', cuisine: 'Chinese', city: 'Chennai', address: '8 Anna Salai, T. Nagar',
    phone: '044-5550-0103', openTime: '11:00', closeTime: '22:00',
    description: 'Indo-Chinese favourites and hot wok specials.',
    menu: [
      ['Starters', 'Veg Spring Rolls', 140, true], ['Starters', 'Chilli Chicken', 230, false],
      ['Mains', 'Veg Hakka Noodles', 190, true], ['Mains', 'Chicken Fried Rice', 220, false],
      ['Mains', 'Paneer Manchurian', 240, true], ['Soups', 'Hot & Sour Soup', 110, true],
      ['Desserts', 'Honey Noodles with Ice Cream', 160, true], ['Drinks', 'Lime Soda', 60, true],
    ],
  },
  {
    name: 'Grill House 47', cuisine: 'North Indian', city: 'Chennai', address: '47 Velachery Main Road',
    phone: '044-5550-0104', openTime: '12:00', closeTime: '23:00',
    description: 'Tandoor grills, rich curries and fresh naan.',
    menu: [
      ['Starters', 'Paneer Tikka', 260, true], ['Starters', 'Tandoori Chicken', 320, false],
      ['Mains', 'Butter Chicken', 340, false], ['Mains', 'Dal Makhani', 220, true],
      ['Breads', 'Butter Naan', 50, true], ['Breads', 'Garlic Naan', 60, true],
      ['Desserts', 'Gulab Jamun', 80, true], ['Drinks', 'Sweet Lassi', 90, true],
    ],
  },
];

const tableSpecs = [['T1', 2], ['T2', 2], ['T3', 4], ['T4', 4], ['T5', 4], ['T6', 6], ['T7', 6], ['T8', 8]];

const run = async () => {
  const missing = ['MONGO_URI', 'SEED_ADMIN_EMAIL', 'SEED_ADMIN_PASSWORD', 'SEED_DEMO_PASSWORD'].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`Missing in backend/.env: ${missing.join(', ')}`);
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  await Promise.all([User, Restaurant, Menu, Table, Reservation, Order].map((m) => m.deleteMany({})));

  // Users (passwords hashed by the model's pre-save hook)
  await User.create({ name: 'Admin', email: SEED_ADMIN_EMAIL, password: SEED_ADMIN_PASSWORD, role: 'admin' });
  const customers = [];
  for (const [name, email] of [['Demo Customer One', 'customer1@example.com'], ['Demo Customer Two', 'customer2@example.com'], ['Demo Customer Three', 'customer3@example.com']]) {
    customers.push(await User.create({ name, email, password: SEED_DEMO_PASSWORD, phone: '9000000000' }));
  }

  // Restaurants, tables, menu items
  const created = [];
  for (const { menu, ...data } of restaurants) {
    const r = await Restaurant.create(data);
    const tables = await Table.insertMany(tableSpecs.map(([tableNumber, capacity]) => ({ restaurant: r._id, tableNumber, capacity })));
    const items = await Menu.insertMany(menu.map(([category, name, price, isVeg]) => ({ restaurant: r._id, category, name, price, isVeg })));
    created.push({ r, tables, items });
  }

  // Sample reservations (future dates so they stay valid for the demo)
  const [a, b] = created;
  await Reservation.create([
    { user: customers[0]._id, restaurant: a.r._id, table: a.tables[2]._id, date: dayFromNow(1), timeSlot: '19:00', guests: 4, status: 'confirmed' },
    { user: customers[1]._id, restaurant: b.r._id, table: b.tables[0]._id, date: dayFromNow(2), timeSlot: '20:00', guests: 2, status: 'pending' },
    { user: customers[0]._id, restaurant: b.r._id, table: b.tables[5]._id, date: dayFromNow(3), timeSlot: '13:00', guests: 6, status: 'pending', notes: 'Birthday lunch' },
  ]);

  // Sample orders (payment is simulated)
  const mkOrder = (user, { r, items }, picks, status, orderType = 'pickup') => {
    const lines = picks.map(([i, quantity]) => ({ menuItem: items[i]._id, name: items[i].name, price: items[i].price, quantity }));
    const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
    return { user: user._id, restaurant: r._id, items: lines, subtotal, total: subtotal, status, orderType };
  };
  await Order.create([
    mkOrder(customers[0], a, [[2, 2], [7, 2]], 'delivered'),
    mkOrder(customers[1], b, [[2, 1], [6, 1]], 'preparing'),
    mkOrder(customers[2], created[2], [[2, 2], [4, 1]], 'placed', 'pickup'),
  ]);

  console.log('Seed complete:');
  console.log(`  admin: ${SEED_ADMIN_EMAIL} (password from SEED_ADMIN_PASSWORD)`);
  console.log('  customers: customer1@example.com, customer2@example.com, customer3@example.com (password from SEED_DEMO_PASSWORD)');
  console.log(`  ${created.length} restaurants, ${created.length * tableSpecs.length} tables, 3 reservations, 3 orders`);
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Seed failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
