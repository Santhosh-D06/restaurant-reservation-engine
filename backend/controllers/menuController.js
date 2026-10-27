const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/menus (admin)
exports.create = asyncHandler(async (req, res) => {
  if (!(await Restaurant.exists({ _id: req.body.restaurant }))) throw new AppError('Restaurant not found', 404);
  const item = await Menu.create(req.body);
  res.status(201).json({ success: true, item });
});

// PUT /api/menus/:id (admin)
exports.update = asyncHandler(async (req, res) => {
  const { restaurant, ...data } = req.body; // an item cannot be moved to another restaurant
  const item = await Menu.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!item) throw new AppError('Menu item not found', 404);
  res.json({ success: true, item });
});

// DELETE /api/menus/:id (admin)
exports.remove = asyncHandler(async (req, res) => {
  const item = await Menu.findByIdAndDelete(req.params.id);
  if (!item) throw new AppError('Menu item not found', 404);
  res.json({ success: true, message: 'Menu item removed' });
});
