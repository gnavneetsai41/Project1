import React from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Title from '../components/Title';

const UserImages = () => {
  const location = useLocation();
  const images = location.state?.images || [];  // Retrieve images from state
  useEffect(() => {
    // Store the number of images in localStorage
    localStorage.setItem('imagesCount', images.length);
  }, [images.length]);
  return (
    <div>
      <Title text1={"USER"} text2={"IMAGES"} />
      <div className="uploaded-images">
        {images.length === 0 ? (
          <p>No images uploaded yet.</p>
        ) : (
          images.map((img, index) => (
            <img key={index} src={img} alt={`Upload ${index + 1}`} />
          ))
        )}
      </div>
    </div>
  );
};

export default UserImages;
