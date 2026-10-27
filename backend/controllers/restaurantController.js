const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { generateSlots, escapeRegex } = require('../utils/slots');

// GET /api/restaurants?q=&cuisine=&city=&sort=name|-name
exports.list = asyncHandler(async (req, res) => {
  const { q, cuisine, city, sort } = req.query;
  const filter = {};
  if (q) {
    const rx = new RegExp(escapeRegex(String(q)), 'i');
    filter.$or = [{ name: rx }, { cuisine: rx }, { city: rx }, { description: rx }];
  }
  if (cuisine) filter.cuisine = new RegExp(`^${escapeRegex(String(cuisine))}$`, 'i');
  if (city) filter.city = new RegExp(`^${escapeRegex(String(city))}$`, 'i');
  const restaurants = await Restaurant.find(filter).sort(sort === '-name' ? '-name' : 'name');
  res.json({ success: true, count: restaurants.length, restaurants });
});

// GET /api/restaurants/:id
exports.getOne = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) throw new AppError('Restaurant not found', 404);
  res.json({ success: true, restaurant });
});

// POST /api/restaurants (admin)
exports.create = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.create(req.body);
  res.status(201).json({ success: true, restaurant });
});

// PUT /api/restaurants/:id (admin)
exports.update = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!restaurant) throw new AppError('Restaurant not found', 404);
  res.json({ success: true, restaurant });
});

// DELETE /api/restaurants/:id (admin) - also removes its menu and tables, cancels active reservations
exports.remove = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) throw new AppError('Restaurant not found', 404);
  await Menu.deleteMany({ restaurant: restaurant._id });
  await Table.deleteMany({ restaurant: restaurant._id });
  const active = await Reservation.find({ restaurant: restaurant._id, isActive: true });
  for (const r of active) { r.status = 'cancelled'; await r.save(); }
  await restaurant.deleteOne();
  res.json({ success: true, message: 'Restaurant deleted' });
});

// GET /api/restaurants/:id/menu?category=
exports.menu = asyncHandler(async (req, res) => {
  const filter = { restaurant: req.params.id };
  if (req.query.category) filter.category = req.query.category;
  const items = await Menu.find(filter).sort('category name');
  res.json({ success: true, count: items.length, items });
});

// GET /api/restaurants/:id/tables
exports.tables = asyncHandler(async (req, res) => {
  const tables = await Table.find({ restaurant: req.params.id }).sort('tableNumber');
  res.json({ success: true, count: tables.length, tables });
});

// GET /api/restaurants/:id/availability?date=YYYY-MM-DD&timeSlot=HH:MM&guests=N
// Returns the valid slots and, for the chosen slot, each table with booked / fits flags.
exports.availability = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) throw new AppError('Restaurant not found', 404);
  const slots = generateSlots(restaurant.openTime, restaurant.closeTime);
  const { date, timeSlot } = req.query;
  const guests = Number(req.query.guests) || 1;

  if (!date || !timeSlot) return res.json({ success: true, slots, tables: [] });
  if (!slots.includes(timeSlot)) throw new AppError('Invalid time slot for this restaurant', 400);

  const tables = await Table.find({ restaurant: restaurant._id, isAvailable: true }).sort('tableNumber');
  const booked = await Reservation.find({ restaurant: restaurant._id, date, timeSlot, isActive: true }).select('table');
  const bookedIds = new Set(booked.map((b) => String(b.table)));

  res.json({
    success: true,
    slots,
    tables: tables.map((t) => ({
      ...t.toObject(),
      booked: bookedIds.has(String(t._id)),
      fits: t.capacity >= guests,
    })),
  });
});
