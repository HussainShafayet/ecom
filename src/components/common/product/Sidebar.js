import React, {useEffect, useState} from "react";
import {Accordion, SelectFilter, Loader} from '../../common';
import { FaTags, FaDollarSign, FaIndustry, FaFilter, FaTshirt, FaPalette, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import {useDispatch, useSelector} from "react-redux";
import {fetchShopContent} from "../../../redux/slice/contentSlice";
import {useSearchParams} from "react-router-dom";
import {SidebarSkeleton} from "../skeleton";


// Sidebar Component
const Sidebar = ({ onClose }) => {
  const {isLoading,categories,brands,price_range, colors,sizes,tags, discounts, error} = useSelector((state) => state.content);
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDiscount, setSelectedDiscount] = useState(
    searchParams.get('discount_value') ? searchParams.get('discount_value') : null
  );

  useEffect(() => {
    dispatch(fetchShopContent());
  }, [dispatch])


  const CategoryItem = ({ category }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = () => setIsExpanded(!isExpanded);
    
    const handleCategorySearch = (item) => {
      // Update the searchParams in the URL
      setSearchParams({
        ...Object.fromEntries(searchParams),
      category: item.slug,
      });
    }
    return (
      <li>
        <div className="flex items-center justify-between px-3 py-1">
          <span
            //href={`/products/?category=${category.slug}`}
            className="text-gray-600 hover:text-blue-500 block w-full cursor-pointer"
            onClick={()=>handleCategorySearch(category)}
          >
            {category.name}
          </span>
          {category.children && category.children.length > 0 && (
            <button
              onClick={toggleExpand}
              className="text-gray-500 hover:text-blue-500"
              aria-label="Toggle Subcategories"
            >
              {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
            </button>
          )}
        </div>

        {/* Render Children */}
        {isExpanded && category.children.length > 0 && (
          <ul className="pl-4 border-l border-gray-300 space-y-1">
            {category?.children?.map((child) => (
              <CategoryItem key={child.slug} category={child} />
            ))}
          </ul>
        )}
      </li>
    );
  };


  const PriceRangeFilter = ({ onApply }) => {
    const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  
    const handleApply = () => {
      // Trigger callback with min and max values
      if (onApply) {
        onApply({ min_price: minPrice, max_price: maxPrice });
      }
      // Update the searchParams in the URL
      if (minPrice) {
        setSearchParams({
          ...Object.fromEntries(searchParams),
          min_price: minPrice,
        });
      }
      if(maxPrice){
        setSearchParams({
        ...Object.fromEntries(searchParams),
        max_price: maxPrice,
      });
      }
      
    };
  
    return (
      <div className="flex items-center space-x-2">
        {/* Min Price Input */}
        <input
          type="number"
          placeholder="Min"
          min={price_range?.min_range || ""}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-20 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-500">-</span>
        {/* Max Price Input */}
        <input
          type="number"
          placeholder="Max"
          min={price_range?.max_range || ""}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-20 border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 00-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    );
  };

  const handleDiscountChange = (item) => {
    setSelectedDiscount(item.value === selectedDiscount ? null : item.value);

    // Update the searchParams in the URL
    setSearchParams({
      ...Object.fromEntries(searchParams),
    discount_type: item.discount_type,
    discount_value: item.value
    });
  }
  
  
  return (
    <>
     {isLoading ? <SidebarSkeleton /> :
      error ? (
      <div className="text-center text-red-500 font-semibold py-4">
        {error} - Please try again later.
      </div>
    ) :
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
      
        
        {/*categories*/}
        <Accordion title="Categories" icon={<FaTags className="text-blue-500" />}>
          {isLoading ? (
            <Loader />
          ) : (
            <ul className="space-y-1 max-h-44 overflow-y-auto">
              {categories &&
                categories?.map((category) => (
                  <CategoryItem key={category.slug} category={category} />
                ))}
            </ul>
          )}
        </Accordion>

        {/* Brands with Checkboxes */}
        <Accordion title="Brands" icon={<FaIndustry className="text-yellow-500" />}>
            <SelectFilter items={brands} type='brands' />
        </Accordion>
        

        {/* Tags */}
        <Accordion title="Tags" icon={<FaTags className="text-red-500" />}>
          <SelectFilter items={tags} type='tags' />
        </Accordion>

        

        {/* Price Range Filter */}
        <Accordion title="Price Range" icon={<FaDollarSign className="text-green-500" />}>
          <PriceRangeFilter />
        </Accordion>

  

        {/* Color Filter */}
        <Accordion title="Color" icon={<FaPalette className="text-purple-500" />}>
          <SelectFilter items={colors} type='colors' />
        </Accordion>

        {/* Size Filter */}
        <Accordion title="Size" icon={<FaTshirt className="text-blue-400" />}>
          <SelectFilter items={sizes} type='sizes' />
        </Accordion>
        

        {/* Discount */}
        <Accordion title="Discounts" icon={<FaFilter className="text-red-500" />}>
          <ul className="space-y-1">
            {discounts?.map((discount, index) => (
              <li key={index} className="flex items-center">
                <input
                  type="radio"
                  name="discount"
                  checked={selectedDiscount === discount.value}
                  onChange={() => handleDiscountChange(discount)}
                  className="form-radio text-red-500 rounded-sm mr-2"
                />
                <label className="text-gray-600">
                  {discount.value} {discount.discount_type === 'percentage' ? '%' : '৳'}
                </label>
              </li>
            ))}
          </ul>
        </Accordion>

        
      </div>
    </div>
     }
    </>
  );
};

  export default Sidebar;