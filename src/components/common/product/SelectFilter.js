import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaIndustry } from "react-icons/fa";
import Accordion from "../Accordion";

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
          <li key={item} className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox text-yellow-500 rounded-sm mr-2"
              checked={selectedItems.includes(item)}
              onChange={() => handleItemChange(item)}
            />
            <label className="text-gray-600">{item}</label>
          </li>
        ))}
      </ul>
  );
};

export default SelectFilter;
