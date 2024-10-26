import React, {useEffect} from "react";
import {Accordion, Loader} from '../common';
import { FaTags, FaDollarSign, FaIndustry, FaStar, FaCheck, FaFilter, FaTshirt, FaPalette } from 'react-icons/fa';
import {useDispatch, useSelector} from "react-redux";
import {fetchAllCategories} from "../../redux/slice/categorySlice";


// Sidebar Component
const Sidebar = ({ onClose }) => {
  const {isLoading, categories, error} = useSelector((state)=> state.category);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllCategories());
  }, [dispatch])
  
  
  return (
    <div className="bg-gray-100 p-4 rounded-lg space-y-4 max-h-svh overflow-y-auto lg:sticky top-[100px]">
      {/* Close Icon for Mobile */}
      <div className="flex justify-between items-center lg:hidden mb-4">
        <h3 className="font-semibold text-xl text-gray-800">Filters</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          &#x2715;
        </button>
      </div>

      {/* Filters with Accordions */}
      <div className="space-y-4">
      
        <Accordion title="Categories" icon={<FaTags className="text-blue-500" />}>
          {isLoading ? <Loader />:
            <ul className="space-y-1 max-h-44 overflow-y-auto">
            {categories && categories.map((category)=>(
              <li key={category.name}><a href={`/products/category/${category.slug}`} className="block px-3 py-1 text-gray-600 hover:text-blue-500 hover:bg-gray-100 rounded-md">{category.name}</a></li>
            ))}
            </ul>
          }
        </Accordion>
        
        {/* Price Range Filter */}
        <Accordion title="Price Range" icon={<FaDollarSign className="text-green-500" />}>
          <input type="range" min="0" max="1000" className="w-full accent-green-500 cursor-pointer" />
          <p className="text-gray-600 mt-2">Up to $1000</p>
        </Accordion>

        {/* Brands with Checkboxes */}
        <Accordion title="Brands" icon={<FaIndustry className="text-yellow-500" />}>
          <ul className="space-y-1">
            {['Brand A', 'Brand B', 'Brand C'].map((brand) => (
              <li key={brand} className="flex items-center">
                <input type="checkbox" className="form-checkbox text-yellow-500 rounded-sm mr-2" />
                <label className="text-gray-600">{brand}</label>
              </li>
            ))}
          </ul>
        </Accordion>

        {/* Ratings Filter */}
        <Accordion title="Ratings" icon={<FaStar className="text-yellow-400" />}>
          <ul className="space-y-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <li key={star} className="flex items-center">
                {[...Array(star)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
                <a href="#" className="ml-2 text-gray-600 hover:text-yellow-500"> & Up</a>
              </li>
            ))}
          </ul>
        </Accordion>

        {/* Color Filter */}
        <Accordion title="Color" icon={<FaPalette className="text-purple-500" />}>
          <div className="flex space-x-2">
            {['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-gray-500'].map((color, index) => (
              <div key={index} className={`${color} w-6 h-6 rounded-full cursor-pointer`} />
            ))}
          </div>
        </Accordion>

        {/* Size Filter */}
        <Accordion title="Size" icon={<FaTshirt className="text-blue-400" />}>
          <ul className="flex space-x-2">
            {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
              <li key={size}>
                <button className="px-2 py-1 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100">{size}</button>
              </li>
            ))}
          </ul>
        </Accordion>

        {/* Availability Filter */}
        <Accordion title="Availability" icon={<FaCheck className="text-green-500" />}>
          <ul className="space-y-1">
            <li><a href="#" className="block px-3 py-1 text-gray-600 hover:text-green-500 hover:bg-gray-100 rounded-md">In Stock</a></li>
            <li><a href="#" className="block px-3 py-1 text-gray-600 hover:text-green-500 hover:bg-gray-100 rounded-md">Out of Stock</a></li>
          </ul>
        </Accordion>

        {/* Discounts with Checkboxes */}
        <Accordion title="Discounts" icon={<FaFilter className="text-red-500" />}>
          <ul className="space-y-1">
            {['10% or more', '20% or more', '50% or more'].map((discount) => (
              <li key={discount} className="flex items-center">
                <input type="checkbox" className="form-checkbox text-red-500 rounded-sm mr-2" />
                <label className="text-gray-600">{discount}</label>
              </li>
            ))}
          </ul>
        </Accordion>
      </div>
    </div>
  );
};

  export default Sidebar;