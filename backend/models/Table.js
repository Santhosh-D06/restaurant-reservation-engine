const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    tableNumber: { type: String, required: [true, 'Table number is required'], trim: true },
    capacity: { type: Number, required: [true, 'Capacity is required'], min: 1, max: 20 },
    isAvailable: { type: Boolean, default: true }, // admin can switch a table off
  },
  { timestamps: true }
);

tableSchema.index({ restaurant: 1, tableNumber: 1 }, { unique: true });

module.exports = mongoose.model('Table', tableSchema);
