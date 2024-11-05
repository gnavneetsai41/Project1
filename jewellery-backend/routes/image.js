const express = require('express');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const Image = require('../models/Image');
const router = express.Router();

// Configure Multer to handle image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload an image
router.post('/upload', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const image = new Image({ user: req.user._id, imageUrl: req.file.buffer.toString('base64') });
    await image.save();

    // Optionally push the image into the user's images array if you have that set up
    req.user.images.push(image);
    await req.user.save();

    res.json({ message: 'Image uploaded successfully', imageUrl: image.imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error); // Log the error for debugging
    res.status(500).json({ message: 'Server error' });
  }
});


// Get user images
router.get('/my-images', authMiddleware, async (req, res) => {
  try {
    const images = await Image.find({ user: req.user._id });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
