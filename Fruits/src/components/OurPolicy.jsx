// eslint-disable-next-line no-unused-vars
import React from 'react'
import { assets } from '../assets/assets'

const Ourpolicy = () => {
  return (
    <div className='flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-sm md:text-base text-gray-700'>
        <div>
            <img src={assets.policy} className='w-20 m-auto mb-5' alt="" />
            <p className='font-semibold '>Easy Exchange Policy</p>
            <p className='text-gray-400 '>We offer hassle free exchange policy</p>
        </div>
        <div>
            <img src={assets.corret} className='w-24 m-auto mb-10' alt="" />
            
            <p className='font-semibold '>7 Day Return Policy</p>
            <p className='text-gray-400 '>We provide 7 day free return policy</p>
        </div>
        <div>
            <img src={assets.support} className='w-20 m-auto mb-5' alt="" />
            <p className='font-semibold '>Best Customer Support</p>
            <p className='text-gray-400 '>We provide 24/7 customer support</p>
        </div>
    </div>
  )
}

export default Ourpolicy