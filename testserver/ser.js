const express = require('express');
const multer = require('multer');
const cors = require('cors'); // Enable CORS for cross-origin requests (if necessary)

const app = express();
const port = process.env.PORT || 5002; // Use environment variable for port

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Specify the directory for uploaded images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}${file.originalname.split('.').pop()}`;
    cb(null, uniqueSuffix);
  }
});

const upload = multer({ storage });

// Enable CORS if necessary based on your application setup
app.use(cors());

// Route for image upload
app.post('/api/images/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`; // Assuming relative path for image URL

    // You can store the image URL in a database or handle it as needed based on your application logic
    // ... (Implement database storage or other logic)

    res.json({ message: 'Image uploaded successfully', imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle any other routes or error handling as needed

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});