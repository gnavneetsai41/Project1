import React from 'react'
import img from '../assets/sketch.jpg';

function Hero({ onButtonClick }) {
  const token = localStorage.getItem('token');
  return (
   
    <div className='flex flex-col sm-flex-row border border-gray-400'>
         {/* hero left side */}
         <div className='w-full sm:w1/2 flex items-center justify-center py-10 am:py-0'>
         <div className='text-[#414141]'>
            <div className='flex items-center gap-2'>
                <p className='w-8 md:w11 h-[2px] bg-[#414141]'></p>
                <p className='font-medium text-sm md:text-base'>IMAGE CONVERTION</p>
                
                
            </div>
            <h1 className='prata-regular teaxt-3xl sm:py-3 lg:text-5xl leading-relaxed'>
                    Model
                </h1>
            <div className='flex items-center gap-2'>
                    <p className='font-semibold text-sum md:text-base'> DO HERE</p>
                    <p className='w-8 md:w-11 h-[1px] bg-[414141]'></p>
            </div>

         </div>
         <img src={img} alt="" className='w-full sm:w-1/2'/>
         </div>
         <button onClick={onButtonClick} 
         className="upload-button"
         disabled={!token}
          style={{
            cursor: token ? 'pointer' : 'not-allowed'
          }}>
        Image Uploader
      </button>
    </div>

      
  
  );
}

export default Hero;