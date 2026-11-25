const mongoose = require('mongoose');

const QuoteRequestSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  email: { type: String, default: '', trim: true, lowercase: true },
  message: { type: String, default: '', maxlength: 2000 },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  file: {
    url: { type: String, default: '' },
    name: { type: String, default: '' },
    size: { type: Number, default: 0 },
    // المسار داخل UPLOADS_DIR/private (لا يُرسل للعامة)
    path: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'done', 'rejected'],
    default: 'new',
    index: true,
  },
  adminNote: { type: String, default: '', maxlength: 1000 },
}, { timestamps: true });

module.exports = mongoose.model('QuoteRequest', QuoteRequestSchema);
