import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you're using react-router for navigation
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [currentState, setCurrentState] = useState('Login');
    const navigate = useNavigate();

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        const body = currentState === 'Login'
            ? { email, password }  // For login, send email and password
            : { name, email, password };  // For sign up, send email, password, and name

        try {
            const endpoint = currentState === 'Login'
                ? 'http://localhost:5001/api/auth/login'  // Login endpoint
                : 'http://localhost:5001/api/auth/signup'; // Sign up endpoint

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });
                
                // Log the raw response before parsing
                const rawResponse = await response.clone().text(); // Clone response to read as text
                console.log('Raw Response Body:', rawResponse); // Log raw response
                
                const data = await response.json(); // Parse JSON response
                
                if (!response.ok) {
                    // Handle errors
                    const errorMessage = data.message || 'An error occurred'; // Default error message
                    window.alert("Error: " + errorMessage); // Show error message
                } else {
                    localStorage.setItem('username', email);
                    localStorage.setItem('token', data.token);  // Save token in localStorage
                    window.alert(currentState === 'Login' ? 'Login successful!' : 'Signup successful!');
                    navigate('/'); // Redirect to the home page
                }
                
        } catch (error) {
            console.error('Error:', error);  // Log any network or server errors
            window.alert('An error occurred: ' + error.message); // Show network error alert
        }
    };
    const handleGoogleLoginSuccess = (credentialResponse) => {
        const decodedToken = jwtDecode(credentialResponse.credential);
        console.log('Google Login Response:', decodedToken);
    
        // **Handle Successful Google Login Logic**
        // - Send the necessary user information (e.g., email, name) to your backend for authentication/account creation
        // - Obtain any required access or refresh tokens from your backend
        // - Update your application state to reflect the logged-in user
        // - Redirect to the appropriate page
    
        // Example Backend API Call (replace with your actual API endpoint):
        fetch('http://localhost:5001/api/auth/google-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ googleToken: credentialResponse.credential }),
        })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              localStorage.setItem('token', data.token); // Store token
              navigate('/'); // Redirect to home page
            } else {
              window.alert('Error: ' + data.message); // Handle errors
            }
          })
          .catch(error => {
            console.error('Error:', error);
            window.alert('An error occurred: ' + error.message);
          });
      };
    
      const handleGoogleLoginFailure = () => {
        console.error('Google Login Failed');
        window.alert('Login failed. Please try again.');
      };
    
      

    return (
        <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
          
      
            {/* <GoogleLogin
  onSuccess={credentialResponse => {
    var credentialResponseDecoded = jwtDecode(credentialResponse.credential);
    console.log(credentialResponseDecoded);
  }}
  onError={() => {
    console.log('Login Failed');
  }}
/> */}
{/* <button onClick={() => login()}>Sign in with Google 🚀</button> */}

            <div className='inline-flex items-center gap-2 mb-2 mt-10'>
                <p className='prata-regular text-3xl'>{currentState === 'Login' ? 'Login' : 'Sign Up'}</p>
                <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
                
            </div>
            <GoogleLogin
        clientId="YOUR_GOOGLE_CLIENT_ID" // Replace with your Google Client ID
        onSuccess={handleGoogleLoginSuccess}
        onError={handleGoogleLoginFailure}
      />
            {currentState === 'Sign Up' && (
                <input 
                    type="text" 
                    className='w-full px-3 py-2 border border-gray-800' 
                    placeholder='Name' 
                    value={name}
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    
                />
            )}
             <input 
                type="email" 
                className='w-full px-3 py-2 border border-gray-800' 
                placeholder='Email' 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
            />
            <input 
                type="password" 
                className='w-full px-3 py-2 border border-gray-800' 
                placeholder='Password' 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
            />
            <div className='w-full flex justify-between text-sm mt-[-8px]'>
                <p>Forgot password?</p>
                {
                    currentState === 'Login'
                    ? <p className='cursor-pointer' onClick={() => setCurrentState('Sign Up')}>Create Account</p>
                    : <p className='cursor-pointer' onClick={() => setCurrentState('Login')}>Login here</p>
                }
            </div>
            <button className='bg-black text-white font-light px-8 py-2 mt-4'>
                {currentState === 'Login' ? 'Log In' : 'Sign Up'}
            </button>
        </form>
    );
}

export default Login;

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// function Login() {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [name, setName] = useState('');
//     const [currentState, setCurrentState] = useState('Login');
//     const navigate = useNavigate();

//     const onSubmitHandler = async (event) => {
//         event.preventDefault();

//         const body = currentState === 'Login'
//             ? { email, password }  // For login, send email and password
//             : { email, password, name };  // For sign up, send email, password, and name

//         try {
//             const endpoint = currentState === 'Login'
//                 ? 'http://localhost:3000/api/auth/login'  // Login endpoint
//                 : 'http://localhost:3000/api/auth/signup'; // Sign up endpoint

//             const response = await fetch(endpoint, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(body),
//             });

//             const data = await response.json();

//             if (!response.ok) {
//                 // Display an error alert if login/signup fails
//                 alert(`Error: ${data.message || 'An error occurred'}`);
//             } else {
//                 // Save token and navigate on success
//                 localStorage.setItem('token', data.token);
//                 alert(`${currentState} successful!`);
//                 navigate('/'); // Navigate to home or any other page after login
//             }
//         } catch (error) {
//             console.error('Error:', error);
//             alert('Error with the request. Please try again.');
//         }
//     };

//     return (
//         <form onSubmit={onSubmitHandler} className='flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800'>
//             <div className='inline-flex items-center gap-2 mb-2 mt-10'>
//                 <p className='prata-regular text-3xl'>{currentState === 'Login' ? 'Login' : 'Sign Up'}</p>
//                 <hr className='border-none h-[1.5px] w-8 bg-gray-800' />
//             </div>
//             <input 
//                 type="email" 
//                 className='w-full px-3 py-2 border border-gray-800' 
//                 placeholder='Email' 
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)} 
//                 required 
//             />
//             {currentState === 'Sign Up' && (
//                 <input 
//                     type="text" 
//                     className='w-full px-3 py-2 border border-gray-800' 
//                     placeholder='Name' 
//                     value={name}
//                     onChange={(e) => setName(e.target.value)} 
//                     required 
//                 />
//             )}
//             <input 
//                 type="password" 
//                 className='w-full px-3 py-2 border border-gray-800' 
//                 placeholder='Password' 
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)} 
//                 required 
//             />
//             <div className='w-full flex justify-between text-sm mt-[-8px]'>
//                 <p>Forgot password?</p>
//                 {
//                     currentState === 'Login'
//                     ? <p className='cursor-pointer' onClick={() => setCurrentState('Sign Up')}>Create Account</p>
//                     : <p className='cursor-pointer' onClick={() => setCurrentState('Login')}>Login here</p>
//                 }
//             </div>
//             <button className='bg-black text-white font-light px-8 py-2 mt-4'>
//                 {currentState === 'Login' ? 'Log In' : 'Sign Up'}
//             </button>
//         </form>
//     );
// }

// export default Login;
