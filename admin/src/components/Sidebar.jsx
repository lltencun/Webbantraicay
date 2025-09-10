// eslint-disable-next-line no-unused-vars
import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  return (
    <div className='w-[18%] min-h-screen border-r-2'>
        <div className='flex flex-col gap-4 pt-6 p-[20%] text-[15px]'>
            <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="/">
                <img className='w-5 h-5' src={assets.order_icon} alt="" />
                <p className='hidden md:block'>List Items</p>
            </NavLink>

            <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="/orders">
                <img className='w-5 h-5' src={assets.order_icon} alt="" />
                <p className='hidden md:block'>Orders</p>
            </NavLink>
             {/* Link đến quản lý người dùng */}
             <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l" to="/users">
                <img className='w-5 h-5' src={assets.user_icon} alt="" />
                <p className='hidden md:block'>Users</p>
            </NavLink>
            <NavLink
                className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
                to="/categories"
                >
                <img className="w-5 h-5" src={assets.order_icon} alt="Categories" />
                <p className="hidden md:block">Categories</p>
            </NavLink>
            <NavLink
                className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
                to="/revenue"
                >
                <img className="w-5 h-5" src={assets.revenue_icon} alt="Revenue" />
                <p className="hidden md:block">Revenue</p>
            </NavLink>
            <NavLink
                className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
                to="/origins"
                >
                <img className="w-5 h-5" src={assets.order_icon} alt="Origins" />
                <p className="hidden md:block">Origins</p>
            </NavLink>
            <NavLink
                className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
                to="/product-details"
                >
                <img className="w-5 h-5" src={assets.order_icon} alt="Product Details" />
                <p className="hidden md:block">Product Details</p>
            </NavLink>
            <NavLink
                className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
                to="/product-types"
                >
                <img className="w-5 h-5" src={assets.order_icon} alt="Product Types" />
                <p className="hidden md:block">Product Types</p>
            </NavLink>
            <NavLink
                className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l"
                to="/delivery-persons"
                >
                <img className="w-5 h-5" src={assets.user_icon} alt="Delivery Persons" />
                <p className="hidden md:block">Delivery Persons</p>
            </NavLink>
        </div>
    </div>
  )
}

export default Sidebar