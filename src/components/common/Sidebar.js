import React from "react";
import {Accordion} from '../common';

// Sidebar Component
const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <div className="space-y-4 sticky top-0">
        {/* Categories Accordion */}
        <Accordion title="Categories">
          <ul className="space-y-1">
            <li><a href="#" className="text-blue-500">Electronics</a></li>
            <li><a href="#" className="text-blue-500">Clothing</a></li>
            <li><a href="#" className="text-blue-500">Home & Garden</a></li>
          </ul>
        </Accordion>
  
        {/* Price Range Accordion */}
        <Accordion title="Price Range">
          <input type="range" min="0" max="1000" className="w-full" />
          <p className="text-gray-600">Up to $1000</p>
        </Accordion>
  
        {/* Brands Accordion */}
        <Accordion title="Brands">
          <ul className="space-y-1">
            <li><a href="#" className="text-blue-500">Brand A</a></li>
            <li><a href="#" className="text-blue-500">Brand B</a></li>
            <li><a href="#" className="text-blue-500">Brand C</a></li>
          </ul>
        </Accordion>
  
        {/* Other Filters */}
        <Accordion title="Other Filters">
          <ul className="space-y-1">
            <li><a href="#" className="text-blue-500">New Arrivals</a></li>
            <li><a href="#" className="text-blue-500">Top Rated</a></li>
            <li><a href="#" className="text-blue-500">On Sale</a></li>
          </ul>
        </Accordion>
      </div>
    );
  };

  export default Sidebar;