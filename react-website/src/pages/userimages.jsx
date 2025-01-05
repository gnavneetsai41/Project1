import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserImages = () => {
  const [images, setImages] = useState([]);  // Initialize as empty array
  const [imageCount, setImageCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve token from local storage

        const response = await axios.get('http://localhost:5001/api/images/my-images', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const fetchedImages = Array.isArray(response.data) ? response.data : [];  // Ensure response is an array
        setImages(fetchedImages);

        // Set image count in both state and local storage
        const count = fetchedImages.length;
        setImageCount(count);
        localStorage.setItem('imageCount', count); // Save count to local storage
      } catch (err) {
        setError('Error fetching images. Please try again later.');
        console.error(err);
      }
    };

    fetchImages();
  }, []);

  return (
    <div>
      <h2>Your Uploaded Images</h2>
      {error && <p className="error">{error}</p>}

      {/* Display image count */}
      <p>Total images uploaded: {imageCount}</p>

      <div className="image-gallery">
        {images.length > 0 ? (
          images.map((image) => (
            <div key={image._id} className="image-container">
              <img
                src={image.imageUrl} // Assumes imageUrl is stored in base64 format
                alt="User upload"
                style={{ maxWidth: '100%', maxHeight: '200px' }}
              />
              <p>Uploaded at: {new Date(image.uploadedAt).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p>No images uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default UserImages;
