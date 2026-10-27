const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/stats
exports.stats = asyncHandler(async (req, res) => {
  const [customers, restaurants, tables, menuItems, resTotal, resPending, resConfirmed, resCancelled,
    ordTotal, ordActive, ordDelivered, ordCancelled, revenueAgg] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    Restaurant.countDocuments(),
    Table.countDocuments(),
    Menu.countDocuments(),
    Reservation.countDocuments(),
    Reservation.countDocuments({ status: 'pending' }),
    Reservation.countDocuments({ status: 'confirmed' }),
    Reservation.countDocuments({ status: 'cancelled' }),
    Order.countDocuments(),
    Order.countDocuments({ status: { $in: ['placed', 'confirmed', 'preparing', 'ready'] } }),
    Order.countDocuments({ status: 'delivered' }),
    Order.countDocuments({ status: 'cancelled' }),
    Order.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
  ]);

  res.json({
    success: true,
    stats: {
      customers, restaurants, tables, menuItems,
      reservations: { total: resTotal, pending: resPending, confirmed: resConfirmed, cancelled: resCancelled },
      orders: { total: ordTotal, active: ordActive, delivered: ordDelivered, cancelled: ordCancelled },
      orderValue: revenueAgg[0]?.total || 0, // sum of non-cancelled orders (simulated payments)
    },
  });
});

// GET /api/admin/customers
exports.customers = asyncHandler(async (req, res) => {
  const [users, resCounts, ordCounts] = await Promise.all([
    User.find({ role: 'customer' }).sort('-createdAt'),
    Reservation.aggregate([{ $group: { _id: '$user', n: { $sum: 1 } } }]),
    Order.aggregate([{ $group: { _id: '$user', n: { $sum: 1 } } }]),
  ]);
  const rMap = new Map(resCounts.map((x) => [String(x._id), x.n]));
  const oMap = new Map(ordCounts.map((x) => [String(x._id), x.n]));
  const customers = users.map((u) => ({
    ...u.toObject(),
    reservationCount: rMap.get(String(u._id)) || 0,
    orderCount: oMap.get(String(u._id)) || 0,
  }));
  res.json({ success: true, count: customers.length, customers });
});
