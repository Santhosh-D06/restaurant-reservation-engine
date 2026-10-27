const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');
const Table = require('../models/Table');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { generateSlots, isPast } = require('../utils/slots');

const DOUBLE_BOOKED = 'This table is already booked for the selected date and time';

// Shared checks for create and modify. Returns nothing; throws AppError on failure.
const validateBooking = async ({ restaurantId, tableId, date, timeSlot, guests, excludeId }) => {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new AppError('Restaurant not found', 404);

  const table = await Table.findById(tableId);
  if (!table || String(table.restaurant) !== String(restaurant._id)) {
    throw new AppError('Table does not belong to this restaurant', 400);
  }
  if (!table.isAvailable) throw new AppError('This table is currently unavailable', 400);
  if (guests > table.capacity) throw new AppError(`This table seats at most ${table.capacity} guests`, 400);
  if (!generateSlots(restaurant.openTime, restaurant.closeTime).includes(timeSlot)) {
    throw new AppError(`Time slot must be an hourly slot between ${restaurant.openTime} and ${restaurant.closeTime}`, 400);
  }
  if (isPast(date, timeSlot)) throw new AppError('Reservation must be in the future', 400);

  const clash = { table: table._id, date, timeSlot, isActive: true };
  if (excludeId) clash._id = { $ne: excludeId };
  if (await Reservation.exists(clash)) throw new AppError(DOUBLE_BOOKED, 409);
};

// The unique partial index still protects against two simultaneous requests.
const saveOrConflict = async (doc) => {
  try {
    await doc.save();
  } catch (err) {
    if (err.code === 11000) throw new AppError(DOUBLE_BOOKED, 409);
    throw err;
  }
};

const populate = (q) => q.populate('restaurant', 'name city').populate('table', 'tableNumber capacity');

// POST /api/reservations
exports.create = asyncHandler(async (req, res) => {
  const { restaurant, table, date, timeSlot, guests, notes } = req.body;
  await validateBooking({ restaurantId: restaurant, tableId: table, date, timeSlot, guests });
  const reservation = new Reservation({ user: req.user._id, restaurant, table, date, timeSlot, guests, notes });
  await saveOrConflict(reservation);
  res.status(201).json({ success: true, reservation });
});

// GET /api/reservations/my
exports.mine = asyncHandler(async (req, res) => {
  const reservations = await populate(Reservation.find({ user: req.user._id }).sort('-date -timeSlot'));
  res.json({ success: true, count: reservations.length, reservations });
});

// GET /api/reservations/:id (owner or admin)
exports.getOne = asyncHandler(async (req, res) => {
  const reservation = await populate(Reservation.findById(req.params.id)).populate('user', 'name email');
  if (!reservation) throw new AppError('Reservation not found', 404);
  if (req.user.role !== 'admin' && String(reservation.user._id) !== String(req.user._id)) {
    throw new AppError('Not allowed to view this reservation', 403);
  }
  res.json({ success: true, reservation });
});

// PUT /api/reservations/:id (owner) - change table/date/time/guests/notes; goes back to "pending"
exports.modify = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw new AppError('Reservation not found', 404);
  if (String(reservation.user) !== String(req.user._id)) throw new AppError('Not allowed to modify this reservation', 403);
  if (reservation.status === 'cancelled') throw new AppError('Cancelled reservations cannot be modified', 400);

  const next = {
    table: req.body.table || reservation.table,
    date: req.body.date || reservation.date,
    timeSlot: req.body.timeSlot || reservation.timeSlot,
    guests: req.body.guests || reservation.guests,
  };
  await validateBooking({
    restaurantId: reservation.restaurant, tableId: next.table, date: next.date,
    timeSlot: next.timeSlot, guests: next.guests, excludeId: reservation._id,
  });
  Object.assign(reservation, next);
  if (req.body.notes !== undefined) reservation.notes = req.body.notes;
  reservation.status = 'pending';
  await saveOrConflict(reservation);
  res.json({ success: true, reservation });
});

// PATCH /api/reservations/:id/cancel (owner)
exports.cancel = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw new AppError('Reservation not found', 404);
  if (String(reservation.user) !== String(req.user._id)) throw new AppError('Not allowed to cancel this reservation', 403);
  if (reservation.status === 'cancelled') throw new AppError('Reservation is already cancelled', 400);
  reservation.status = 'cancelled';
  await reservation.save();
  res.json({ success: true, reservation });
});

// GET /api/reservations?status=&restaurant=&date= (admin)
exports.listAll = asyncHandler(async (req, res) => {
  const filter = {};
  ['status', 'restaurant', 'date'].forEach((k) => { if (req.query[k]) filter[k] = req.query[k]; });
  const reservations = await populate(Reservation.find(filter).sort('-date -timeSlot')).populate('user', 'name email phone');
  res.json({ success: true, count: reservations.length, reservations });
});

// PATCH /api/reservations/:id/status (admin) - approve (confirmed) or cancel
exports.setStatus = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw new AppError('Reservation not found', 404);
  if (reservation.status === 'cancelled') throw new AppError('A cancelled reservation cannot be changed', 400);
  reservation.status = req.body.status;
  await reservation.save();
  res.json({ success: true, reservation });
});
