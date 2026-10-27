const mongoose = require('mongoose');

const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;

const restaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Restaurant name is required'], trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500 },
    cuisine: { type: String, required: [true, 'Cuisine is required'], trim: true },
    address: { type: String, required: [true, 'Address is required'], trim: true },
    city: { type: String, required: [true, 'City is required'], trim: true },
    phone: { type: String, trim: true },
    image: { type: String, trim: true, default: '' },
    openTime: { type: String, default: '11:00', match: [hhmm, 'openTime must be HH:MM'] },
    closeTime: { type: String, default: '22:00', match: [hhmm, 'closeTime must be HH:MM'] },
  },
  { timestamps: true }
);

restaurantSchema.index({ name: 1 });
restaurantSchema.index({ cuisine: 1, city: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
