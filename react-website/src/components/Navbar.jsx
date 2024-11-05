import React, { useEffect, useState } from 'react';
import {Link, NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg'; // Correct logo import
import search from '../assets/search.jpg';
import profile from '../assets/profile.jpg';
import photo from '../assets/photo.png';
import menu from '../assets/menu.png';
import arrow from '../assets/arrow.png';
import Profile from './Profile';

const Navbar = () => {
    const [visible, setVisible] = useState(false);
  const [imagesCount, setImagesCount] = useState(0);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  // const [userData, setUserData] = useState(null);
  const userData = localStorage.getItem('username');
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
    // useEffect(() => {

    //     const storedImagesCount = localStorage.getItem('imagesCount');
    //     if (storedImagesCount) {
    //       setImagesCount(parseInt(storedImagesCount));
    //     }
    //     if (token) {
    //         // Fetch user information using the token
    //         fetch('http://localhost:5001/api/auth/login', {
    //           headers: {
    //             Authorization: `Bearer ${token}`
    //           }
    //         })
    //         .then(response => response.json())
    //         .then(data => {
    //           setUserData(data);
    //         })
    //         .catch(error => {
    //           console.log('Error fetching user data:', error);
    //         });
    //       }
    //   }, []);
    
    
  return (
    <div className='flex items-center justify-between py-5 font-medium'>
        <Link to='/'><img src={logo} className="w-20 h-11" alt="logo" /></Link>
        <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
            <NavLink to="/" className='flex flex-col items-center gap-1'>
                <p>Home</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
            </NavLink>
            <NavLink to="/about" className='flex flex-col items-center gap-1 '>
                <p>About</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
            </NavLink>
            <NavLink to="/contact" className='flex flex-col items-center gap-1'>
                <p>Contact</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
            </NavLink>
            <NavLink to="/login" className='flex flex-col items-center gap-1'>
                <p>Login</p>
                <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden'/>
            </NavLink>
        </ul>
        <div className='flex items-center gap-6'>
            {/* <img src={search} alt="" className='w-6 cursor-pointer'/> */}
            <div className='group relative'>
            <Link to='/login'>
              <img src={profile} alt="" className='w-6 cursor-pointer'/>
            </Link>
             {token ? ( // Check if token exists
            //   <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
            // <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
            // <p className='cursor-pointer hover:text-black'>My profile</p>
            // <p className='cursor-pointer hover:text-black' onClick={logout}>Log out</p>
            // </div>
            // </div>
            <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-5'>
            <Profile userData={userData} onLogout={logout} />
          </div>
            ) : 
            <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-5'>
              <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded'>
            <Link to='/login'>
            <p className='cursor-pointer hover:text-black'>Login</p>
            </Link>
          </div>
          </div>}
            </div>
            {/* <Link to="..\src\pages\userimages" className='relative'>
            <img src={photo} alt="" className='w-6 cursor-pointer'/>
            <p className='absolute right-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded texr-[8px]'></p>
            </Link> */}
            <Link to="/userimages" className='relative'>
             <img src={photo} alt="" className='w-6 cursor-pointer'/>
             <p className='absolute right-[-5px] w-4 text-center leading-4 bg-black text-white aspect-square rounded texr-[8px]'>{imagesCount}</p>
            </Link>
            <img onClick={()=>setVisible(true)} src={menu} alt="" className='w-6 cursor-pointer'/>
        </div>
        {/*sidebar menu for small screen*/}
        <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all ${visible ? 'w-full':'w-0'}`}>
            <div className='flex flex-col text-gray-600'>
                <div onClick={()=>setVisible(false)}  className='flex items-center gap-4 p-3 cursor-pointer'>
                    <img src={arrow} alt="" className='h-4 rotate-90'/>
                    <p>Back</p>
                </div>
                <NavLink to='/' className='py-2 pl-6 border' onClick={()=> setVisible(false)}>Home</NavLink>
                <NavLink to='/about' className='py-2 pl-6 border' onClick={()=> setVisible(false)}>About</NavLink>
               <NavLink to='/contact' className='py-2 pl-6 border' onClick={()=> setVisible(false)}>Contact</NavLink>
               <NavLink to='/login' className='py-2 pl-6 border' onClick={()=> setVisible(false)}>login</NavLink>
            </div>
           
        </div>
    </div>
  );
};

export default Navbar;
