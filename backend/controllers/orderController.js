const Order = require('../models/Order');
const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const STATUSES = ['placed', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
const TERMINAL = ['delivered', 'cancelled'];

const populateOrder = (q) => q.populate('restaurant', 'name city').populate('user', 'name email');

// POST /api/orders
// Prices are ALWAYS re-read from the database; the client only sends item ids and quantities.
// Payment is simulated (demonstration only): no real payment is processed.
exports.create = asyncHandler(async (req, res) => {
  const { restaurant, items, orderType = 'pickup', deliveryAddress } = req.body;
  if (!(await Restaurant.exists({ _id: restaurant }))) throw new AppError('Restaurant not found', 404);
  if (orderType === 'delivery' && !(deliveryAddress || '').trim()) {
    throw new AppError('Delivery address is required for delivery orders', 400);
  }

  const qtyById = new Map();
  items.forEach((it) => {
    const key = String(it.menuItem);
    qtyById.set(key, (qtyById.get(key) || 0) + Number(it.quantity));
  });

  const menuItems = await Menu.find({ _id: { $in: [...qtyById.keys()] }, restaurant });
  if (menuItems.length !== qtyById.size) throw new AppError("One or more items are not on this restaurant's menu", 400);

  const lines = menuItems.map((m) => {
    if (!m.isAvailable) throw new AppError(`${m.name} is currently unavailable`, 400);
    const quantity = qtyById.get(String(m._id));
    if (quantity > 20) throw new AppError(`Maximum 20 of ${m.name} per order`, 400);
    return { menuItem: m._id, name: m.name, price: m.price, quantity };
  });
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

  const order = await Order.create({
    user: req.user._id, restaurant, items: lines, subtotal, total: subtotal, orderType,
    deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
  });
  res.status(201).json({ success: true, order });
});

// GET /api/orders/my
exports.mine = asyncHandler(async (req, res) => {
  const orders = await populateOrder(Order.find({ user: req.user._id }).sort('-createdAt'));
  res.json({ success: true, count: orders.length, orders });
});

// GET /api/orders/:id (owner or admin)
exports.getOne = asyncHandler(async (req, res) => {
  const order = await populateOrder(Order.findById(req.params.id));
  if (!order) throw new AppError('Order not found', 404);
  if (req.user.role !== 'admin' && String(order.user._id) !== String(req.user._id)) {
    throw new AppError('Not allowed to view this order', 403);
  }
  res.json({ success: true, order });
});

// PATCH /api/orders/:id/cancel (owner, only while still "placed")
exports.cancel = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);
  if (String(order.user) !== String(req.user._id)) throw new AppError('Not allowed to cancel this order', 403);
  if (order.status !== 'placed') throw new AppError('Only orders that have not been confirmed can be cancelled', 400);
  order.status = 'cancelled';
  await order.save();
  res.json({ success: true, order });
});

// GET /api/orders?status=&restaurant= (admin)
exports.listAll = asyncHandler(async (req, res) => {
  const filter = {};
  ['status', 'restaurant'].forEach((k) => { if (req.query[k]) filter[k] = req.query[k]; });
  const orders = await populateOrder(Order.find(filter).sort('-createdAt'));
  res.json({ success: true, count: orders.length, orders });
});

// PATCH /api/orders/:id/status (admin)
exports.setStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) throw new AppError('Invalid status', 400);
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);
  if (TERMINAL.includes(order.status)) throw new AppError(`A ${order.status} order cannot be changed`, 400);
  order.status = status;
  await order.save();
  res.json({ success: true, order });
});
