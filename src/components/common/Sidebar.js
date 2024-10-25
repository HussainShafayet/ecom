import React from "react";
import {Accordion} from '../common';

// Sidebar Component
const Sidebar = ({ onClose }) => (
    <div className="bg-gray-100 p-4 rounded-lg space-y-4 max-h-svh overflow-auto lg:sticky top-[100px]">
      {/* Close Icon for Mobile */}
      <div className="flex justify-between items-center lg:hidden">
        <h3 className="font-semibold text-xl">Filters</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          &#x2715;
        </button>
      </div>
      {/* Filters */}
      <div>
        <h4 className="font-semibold mb-2">Categories</h4>
        <ul className="space-y-1">
          <li><a href="#" className="text-blue-500">Electronics</a></li>
          <li><a href="#" className="text-blue-500">Clothing</a></li>
          <li><a href="#" className="text-blue-500">Home & Garden</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Price Range</h4>
        <input type="range" min="0" max="1000" className="w-full" />
        <p className="text-gray-600">Up to $1000</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Brands</h4>
        <ul className="space-y-1">
          <li><a href="#" className="text-blue-500">Brand A</a></li>
          <li><a href="#" className="text-blue-500">Brand B</a></li>
          <li><a href="#" className="text-blue-500">Brand C</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Categories</h4>
        <ul className="space-y-1">
          <li><a href="#" className="text-blue-500">Electronics</a></li>
          <li><a href="#" className="text-blue-500">Clothing</a></li>
          <li><a href="#" className="text-blue-500">Home & Garden</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Price Range</h4>
        <input type="range" min="0" max="1000" className="w-full" />
        <p className="text-gray-600">Up to $1000</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Brands</h4>
        <ul className="space-y-1">
          <li><a href="#" className="text-blue-500">Brand A</a></li>
          <li><a href="#" className="text-blue-500">Brand B</a></li>
          <li><a href="#" className="text-blue-500">Brand C</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Categories</h4>
        <ul className="space-y-1">
          <li><a href="#" className="text-blue-500">Electronics</a></li>
          <li><a href="#" className="text-blue-500">Clothing</a></li>
          <li><a href="#" className="text-blue-500">Home & Garden</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Price Range</h4>
        <input type="range" min="0" max="1000" className="w-full" />
        <p className="text-gray-600">Up to $1000</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Brands</h4>
        <ul className="space-y-1">
          <li><a href="#" className="text-blue-500">Brand A</a></li>
          <li><a href="#" className="text-blue-500">Brand B</a></li>
          <li><a href="#" className="text-blue-500">Brand C</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Categories</h4>
        <ul className="space-y-1">
          <li><a href="#" className="text-blue-500">Electronics</a></li>
          <li><a href="#" className="text-blue-500">Clothing</a></li>
          <li><a href="#" className="text-blue-500">Home & Garden</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Price Range</h4>
        <input type="range" min="0" max="1000" className="w-full" />
        <p className="text-gray-600">Up to $1000</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Brands</h4>
        <ul className="space-y-1">
          <li><a href="#" className="text-blue-500">Brand A</a></li>
          <li><a href="#" className="text-blue-500">Brand B</a></li>
          <li><a href="#" className="text-blue-500">Brand C</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Categories</h4>
        <ul className="space-y-1">
          <li><a href="#" className="text-blue-500">Electronics</a></li>
          <li><a href="#" className="text-blue-500">Clothing</a></li>
          <li><a href="#" className="text-blue-500">Home & Garden</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Price Range</h4>
        <input type="range" min="0" max="1000" className="w-full" />
        <p className="text-gray-600">Up to $1000</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Brands</h4>
        <ul className="space-y-1">
          <li><a href="#" className="text-blue-500">Brand A</a></li>
          <li><a href="#" className="text-blue-500">Brand B</a></li>
          <li><a href="#" className="text-blue-500">Brand C</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Categories</h4>
        <ul className="space-y-1">
          <li><a href="#" className="text-blue-500">Electronics</a></li>
          <li><a href="#" className="text-blue-500">Clothing</a></li>
          <li><a href="#" className="text-blue-500">Home & Garden</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Price Range</h4>
        <input type="range" min="0" max="1000" className="w-full" />
        <p className="text-gray-600">Up to $1000</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Brands</h4>
        <ul className="space-y-1">
          <li><a href="#" className="text-blue-500">Brand A</a></li>
          <li><a href="#" className="text-blue-500">Brand B</a></li>
          <li><a href="#" className="text-blue-500">Brand C</a></li>
        </ul>
      </div>
    </div>
  );

  export default Sidebar;