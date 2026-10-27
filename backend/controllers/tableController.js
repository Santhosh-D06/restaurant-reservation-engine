const Table = require('../models/Table');
const Restaurant = require('../models/Restaurant');
const Reservation = require('../models/Reservation');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { todayString } = require('../utils/slots');

// POST /api/tables (admin)
exports.create = asyncHandler(async (req, res) => {
  if (!(await Restaurant.exists({ _id: req.body.restaurant }))) throw new AppError('Restaurant not found', 404);
  const table = await Table.create(req.body);
  res.status(201).json({ success: true, table });
});

// PUT /api/tables/:id (admin) - edit number/capacity or toggle isAvailable
exports.update = asyncHandler(async (req, res) => {
  const { restaurant, ...data } = req.body;
  const table = await Table.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!table) throw new AppError('Table not found', 404);
  res.json({ success: true, table });
});

// DELETE /api/tables/:id (admin) - blocked while upcoming active reservations exist
exports.remove = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);
  if (!table) throw new AppError('Table not found', 404);
  const upcoming = await Reservation.exists({ table: table._id, isActive: true, date: { $gte: todayString() } });
  if (upcoming) throw new AppError('Table has upcoming reservations; cancel them first', 409);
  await table.deleteOne();
  res.json({ success: true, message: 'Table removed' });
});
