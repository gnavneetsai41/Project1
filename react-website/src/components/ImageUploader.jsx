


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './ImageUploader.css';
// import Title from './Title';
// import arrow from '../assets/arrow.png';

// const ImageUploader = ({onButtonClick}) => {
//   const [visible, setVisible] = useState(false);
//   // const handleBackClick = () => {
//   //   setVisible(false); // Call the function from parent to hide uploader
//   // };
//   const token = localStorage.getItem('token');
//   const [image, setImage] = useState("");
//   const [uploadedImages, setUploadedImages] = useState([]);
//   const navigate = useNavigate();
//   const [uploadError, setUploadError] = useState(null); // State for error messages

//   // const handleSendImages = () => {
//   //   // Implement logic for sending images to another page (e.g., navigate using useNavigate)
//   //   navigate('/userimages', { state: { images: uploadedImages, imagesCount: uploadedImages.length } });
//   // };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImage(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleUpload = async (e) => {
//     if (!image) {
//       setUploadError('Please select an image to upload.');
//       return; // Exit function if no image selected
//     }

//     const formData = new FormData();
//     formData.append('image', image);

//     try {
//       const response = await fetch('http://localhost:5001/api/images/upload', {
//         method: 'POST',
//         headers: {
//           Authorization: token,
//         },
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error('Upload failed. Please try again.'); // Throw error for non-2xx responses
//       }

//       const data = await response.json();
//       console.log('Image uploaded successfully:', data);
//       alert('Image uploaded successfully!');

//       // Update uploadedImages state (assuming data.imageUrl is the uploaded image URL)
//       setUploadedImages([...uploadedImages, data.imageUrl]);
//       setImage(null);
//       localStorage.setItem('imagesCount', uploadedImages.length);
//     } catch (error) {
//       setUploadError(error.message); // Set error message if upload fails
//       console.error('Upload error:', error);
//     }
//   };



//   return (
    
//     <div className="upload-container">
      
//       <div className="card">
//       <div onClick={onButtonClick}  className='flex items-center gap-4 p-3 cursor-pointer'>
//                     <img src={arrow} alt="" className='h-4 rotate-180'/>
//                     <p>close</p>
//       </div>
//         <Title text1={'UPLOAD '} text2={' IMAGE'} />

//         <div className="image-preview-container">
//           {image ? (
//             <img src={image} alt="Selected" className="image-preview" />
//           ) : (
//             <div className="image-placeholder">
//               <p>Selected Image</p>
//             </div>
//           )}
//         </div>

//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleImageChange}
//           // onChange={(e)=>setImage(e.target.files[0])}
//           id="fileInput"
//           className="file-input"
//         />

//         <label htmlFor="fileInput" className="select-button">
//           Select Image
//         </label>
//         <br />

//         <button className="upload-button" 
//         onChange={(e)=>setImage(e.target.files[0])}
//         onClick={handleUpload} 
        
//         disabled={!image}
//           style={{
//             cursor: image ? 'pointer' : 'not-allowed',
//             backgroundColor: image ? '#4CAF50' : '#ccc',
//           }}
//           >
          
//           Upload
//         </button>

//         {uploadError && (
//           <p className="error-message">{uploadError}</p>
//         )}

//         {uploadedImages.length > 0 ? (
//           <>
//             <h3>Uploaded Images</h3>
//             <div className="uploaded-images">
//               {uploadedImages.map((img, index) => (
//                 <img key={index} src={img} alt={`Upload ${index + 1}`} />
//               ))}
//             </div>
//           </>
//         ) : (
//           <p>No images uploaded yet. Please login and upload an image.</p>
//         )}

//         {/* Button to send images to another page */}
//         {/* <button onClick={handleSendImages} className="send-button">
//           Save Images
//         </button> */}
        
//       </div>
//     </div>
//   );
// };

// export default ImageUploader;

// import React, { useState } from 'react';

// const ImageUpload = ({ onUploadSuccess, onUploadError }) => {
//   const [image, setImage] = useState(null);
//   const [uploadError, setUploadError] = useState(null);
//   const [uploadedImages, setUploadedImages] = useState([]);

//   const handleImageChange = (event) => {
//     const newImage = event.target.files[0];
//     setImage(newImage);
//     setUploadError(null); // Clear previous error on new selection
//   };

//   const handleUpload = async () => {
//     if (!image) {
//       setUploadError('Please select an image to upload');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('image', image);

//     try {
//       const response = await fetch('/api/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error('Upload failed');
//       }

//       const data = await response.json();
//       setImage(null); // Clear image preview after successful upload
//       setUploadedImages([...uploadedImages, data.imageUrl]);
//       onUploadSuccess && onUploadSuccess(data.imageUrl); // Call optional success callback
//     } catch (error) {
//       console.error('Upload error:', error);
//       setUploadError(error.message || 'Upload failed');
//     }
//   };

//   // const handleSendImages = () => {
//   //   // Implement logic to handle sending uploaded images to another page (e.g., using React Router or a state management library)
//   // };

//   return (
//     <div className="upload-container">
//       <div className="card">
//         <div onClick={() => { /* Handle close button functionality */ }} className="flex items-center gap-4 p-3 cursor-pointer">
//           <img src={arrow} alt="" className="h-4 rotate-180" />
//           <p>close</p>
//         </div>
//         <Title text1={'UPLOAD '} text2={' IMAGE'} />

//         <div className="image-preview-container">
//           {image ? (
//             <img src={URL.createObjectURL(image)} alt="Selected" className="image-preview" />
//           ) : (
//             <div className="image-placeholder">
//               <p>Selected Image</p>
//             </div>
//           )}
//         </div>

//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleImageChange}
//           id="fileInput"
//           className="file-input"
//         />

//         <label htmlFor="fileInput" className="select-button">
//           Select Image
//         </label>
//         <br />

//         <button
//           className="upload-button"
//           onClick={handleUpload}
//           disabled={!image}
//           style={{
//             cursor: image ? 'pointer' : 'not-allowed',
//             backgroundColor: image ? '#4CAF50' : '#ccc',
//           }}
//         >
//           Upload
//         </button>

//         {uploadError && <p className="error-message">{uploadError}</p>}

//         {uploadedImages.length > 0 ? (
//           <>
//             <h3>Uploaded Images</h3>
//             <div className="uploaded-images">
//               {uploadedImages.map((img, index) => (
//                 <img key={index} src={img} alt={`Upload ${index + 1}`} />
//               ))}
//             </div>
//           </>
//         ) : (
//           <p>No images uploaded yet.</p>
//         )}

//         {/* <button onClick={handleSendImages} className="send-button">
//           Save Images
//         </button> */}
//       </div>
//     </div>
//   );
// };

// export default ImageUpload;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ImageUploader.css';
import Title from './Title';
import arrow from '../assets/arrow.png';

const ImageUploader = ({ onButtonClick }) => {
  const [image, setImage] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const token = localStorage.getItem('token');
  console.log(localStorage.getItem('token'));


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // base64 image string
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!image) {
      setUploadError('Please select an image to upload.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/images/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Make sure token is correctly set here
        },
        body: JSON.stringify({ image }),
      });
      

      if (!response.ok) {
        throw new Error('Upload failed. Please try again.');
      }

      const data = await response.json();
      alert('Image uploaded successfully!');
      setUploadedImages([...uploadedImages, data.imageUrl]);
      setImage(null);
      setUploadError(null);
    } catch (error) {
      setUploadError(error.message);
    }
  };

  return (
    <div className="upload-container">
      <div className="card">
        <div onClick={onButtonClick} className='flex items-center gap-4 p-3 cursor-pointer'>
          <img src={arrow} alt="" className='h-4 rotate-180' />
          <p>close</p>
        </div>
        <Title text1={'UPLOAD '} text2={' IMAGE'} />
        <div className="image-preview-container">
          {image ? (
            <img src={image} alt="Selected" className="image-preview" />
          ) : (
            <div className="image-placeholder">
              <p>Selected Image</p>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          id="fileInput"
          className="file-input"
        />
        <label htmlFor="fileInput" className="select-button">Select Image</label>
        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={!image}
          style={{
            cursor: image ? 'pointer' : 'not-allowed',
            backgroundColor: image ? '#4CAF50' : '#ccc',
          }}
        >
          Upload
        </button>
        {uploadError && <p className="error-message">{uploadError}</p>}
        {uploadedImages.length > 0 && (
          <div className="uploaded-images">
            <h3>Uploaded Images</h3>
            {uploadedImages.map((img, index) => (
              <img key={index} src={img} alt={`Upload ${index + 1}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
