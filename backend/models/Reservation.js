const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    date: { type: String, required: true, match: [/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'] },
    timeSlot: { type: String, required: true, match: [/^([01]\d|2[0-3]):[0-5]\d$/, 'timeSlot must be HH:MM'] },
    guests: { type: Number, required: true, min: 1 },
    notes: { type: String, trim: true, maxlength: 200 },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    // true while the booking holds the table; used by the partial unique index below
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reservationSchema.pre('validate', function setActive(next) {
  this.isActive = this.status !== 'cancelled';
  next();
});

// Database-level double-booking guard: one ACTIVE booking per table/date/slot.
// Cancelled bookings are excluded, so the slot becomes free again.
reservationSchema.index(
  { table: 1, date: 1, timeSlot: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

module.exports = mongoose.model('Reservation', reservationSchema);
