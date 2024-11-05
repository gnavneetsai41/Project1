const express = require('express');
const Contact = require('../models/Contact');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect contact submission route with authentication middleware
router.post('/submit', authMiddleware, async (req, res) => {

  try {
      const token = localStorage.getItem('token');
  
      // Check if token exists (indicating logged-in user)
      if (!token) {
        window.alert('Please log in to submit your contact information.');
        return; // Prevent further execution if not logged in
      }
    const { phoneNumber } = req.body;

    const contact = new Contact({
      user: req.user._id,
      phoneNumber,
    });

    await contact.save();
    
    return res.status(200).json({ message: 'Contact submitted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;