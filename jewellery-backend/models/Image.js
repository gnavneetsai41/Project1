const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

ImageSchema.index({ user: 1, uploadedAt: -1 }); // Create an index for efficient querying

const Image = mongoose.model('Image', ImageSchema);
module.exports = Image;