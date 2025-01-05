
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Image = require('../models/Image');
const router = express.Router();
const multer = require('multer');

const upload = multer({ limits: { fileSize: 1024 * 1024 * 10 } }); // 10MB limit
// Upload an image
router.post('/upload', authMiddleware, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ message: 'No image provided' });
    }

    // Save image data in base64 format
    const newImage = new Image({
      user: req.user._id,
      imageUrl: image,
    });

    await newImage.save();

    // Optionally add to user's images array
    req.user.images.push(newImage._id);
    await req.user.save();

    res.json({ message: 'Image uploaded successfully', imageUrl: newImage.imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Retrieve user images
router.get('/my-images', authMiddleware, async (req, res) => {
  try {
    const images = await Image.find({ user: req.user._id });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
