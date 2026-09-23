const mongoose = require('mongoose');

const ProductInteractionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

ProductInteractionSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ProductInteraction', ProductInteractionSchema);
