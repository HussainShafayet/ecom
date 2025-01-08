import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

const SelectFilter = ({ items, type }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedItems, setSelectedItems] = useState(
    searchParams.get(type) ? searchParams.get(type).split(",") : []
  );

  const handleItemChange = (item) => {
    const updatedItems = selectedItems.includes(item)
    ? selectedItems.filter((b) => b !== item) // Remove item if already selected
    : [...selectedItems, item]; // Add item if not selected

    setSelectedItems(updatedItems);

    // Update the searchParams in the URL
    setSearchParams({
      ...Object.fromEntries(searchParams),
    [type]: updatedItems.join(","),
    });
  };

  return (
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.name || item.value || item} className="flex items-center">
          {type === 'colors' ? (
            <>
              <input type="checkbox" 
              checked={selectedItems.includes(item.name)}
              onChange={() => handleItemChange(item.name)}
              className="form-checkbox text-red-500 rounded-sm mr-2" />
              <div className={`w-6 h-6 rounded-full mr-2`} style={{background: item.hex_code}} />
              <label className="text-gray-600">{item.name}</label>
            </>
          ) : (
            <>
              <input
                type="checkbox"
                className="form-checkbox text-yellow-500 rounded-sm mr-2"
                checked={selectedItems.includes(item)}
                onChange={() => handleItemChange(item)}
              />
              <label className="text-gray-600">{item}</label>
            </>
          )}
          </li>
        ))}
      </ul>
  );
};

export default SelectFilter;
