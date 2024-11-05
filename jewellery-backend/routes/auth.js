const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator'); // Import express-validator
const router = express.Router();

// Handle user registration
router.post(
  '/signup',
  [
    
    body('name').notEmpty().withMessage('Name is required and must be valid'),
    body('email').isEmail().withMessage('Email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  ],
  async (req, res)=> {
  const { name, email,password} = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password,
    });

    await newUser.save();
    res.status(201).json({ success: true, message: 'Registration successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error registering user' });
  }
});


// Register
// router.post(
//   '/signup',
//   [
    
//     body('name').notEmpty().withMessage('Name is required and must be valid'),
//     body('email').isEmail().withMessage('Email is required'),
//     body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
//   ],
//   async (req, res) => {
//     // Validate request body
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { name,email,  password } = req.body;

//     try {
//       let user = await User.findOne({ email });
//       if (user) {
//         return res.status(400).json({ message: 'User already exists' });
//       }

//       // Hash password
//       const hashedPassword = await bcrypt.hash(password, 10);
//       // const salt = await bcrypt.genSalt(10);
//       // const hashedPassword = await bcrypt.hash(password, salt);

//       user = new User({ name, email, password: hashedPassword });
//       await user.save();

//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//       res.status(201).json({ token });
//     } catch (error) {
//       console.error('Signup Error:', error); // Log the error for debugging
//       res.status(500).json({ message: 'Server error' });
//     }
//   }
// );

// Login
// router.post(
//   '/login',
//   [
//     body('email').isEmail().withMessage('Email is required and must be valid'),
//     body('password').notEmpty().withMessage('Password is required')
//   ],
//   async (req, res) => {
//     // Validate request body
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }

//     const { email, password } = req.body;

//     try {
//       const user = await User.findOne({ email });
//       if (!user) {
       
//         return res.status(400).json({ message: 'Invalid email' });
//       }

//       const isMatch = await bcrypt.compare(password, user.password);
//       if (!isMatch) {
      
//         return res.status(400).json({ message: 'Invalid password' });
//       }

//       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//       res.json({ token });
//     } catch (error) {
//       console.error('Login Error:', error); // Log the error for debugging
//       res.status(500).json({ message: 'Server error' });
//     }
//   }
// );
// Login
router.post('/login', [
  body('email').isEmail().withMessage('Email is required and must be valid'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // Return specific validation errors
  }

  const { email, password } = req.body;

  try {
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Create JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token }); // Respond with token
  } catch (error) {
      console.error('Login Error:', error);
      res.status(500).json({ message: 'Server error' });
  }
});

// router.post('/login', [
//   body('email').isEmail().withMessage('Email is required and must be valid'),
//   body('password').notEmpty().withMessage('Password is required')
// ], async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const email = await User.findOne({ email });

//     if (email) {
//       const isMatch = await bcrypt.compare(password, email.password);
//       if (isMatch) {
//         res.status(200).json({ success: true, message: 'Login successful' });
//       } else {
//         res.status(401).json({ success: false, message: 'Invalid username or password' });
//       }
//     } else {
//       res.status(401).json({ success: false, message: 'Invalid username or password' });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: 'Error logging in' });
//   }
// });



module.exports = router;
