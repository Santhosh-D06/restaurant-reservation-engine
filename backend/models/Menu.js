const mongoose = require('mongoose');

// One document per food item; linked to its restaurant.
const menuSchema = new mongoose.Schema(
  {
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    name: { type: String, required: [true, 'Item name is required'], trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 300 },
    category: { type: String, required: [true, 'Category is required'], trim: true },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    image: { type: String, trim: true, default: '' },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Menu', menuSchema);
