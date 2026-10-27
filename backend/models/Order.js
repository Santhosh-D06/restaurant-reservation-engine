const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
    name: { type: String, required: true },   // snapshot at order time
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: { type: [orderItemSchema], validate: [(v) => v.length > 0, 'Order must have at least one item'] },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    orderType: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
    deliveryAddress: { type: String, trim: true },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
      default: 'placed',
    },
    // Demonstration only: no real payment is processed.
    paymentMethod: { type: String, enum: ['demo'], default: 'demo' },
    paymentStatus: { type: String, enum: ['simulated'], default: 'simulated' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
