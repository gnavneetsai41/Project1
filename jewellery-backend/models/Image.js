const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true }, // Storing as base64
  uploadedAt: { type: Date, default: Date.now },
});

ImageSchema.index({ user: 1, uploadedAt: -1 });

const Image = mongoose.model('Image', ImageSchema);
module.exports = Image;
