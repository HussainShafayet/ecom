import {debounce} from "lodash";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {useDispatch, useSelector} from "react-redux";
import {searchSuggestions, suggestionsInputTime} from "../../redux/slice/productSlice";
import {Link} from "react-router-dom";

const items = [
    "Apple iPhone 13",
    "Samsung Galaxy S22",
    "Sony Headphones",
    "MacBook Pro",
    "Dell XPS 15",
    "HP Spectre",
    "Google Pixel 6",
    "AirPods Pro",
    "Logitech MX Master",
    "Samsung Smart TV",
  ];

//  const handleSelection = (item) => {
//    console.log("Selected:", item);
//  };

const SearchDropdown = () => {
  const [query, setQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();

  const {suggestionsLoading, suggestions, suggestionsError} = useSelector((state)=> state.product);

  useEffect(() => {
    //if (query.length > 0) {
    //  const results = items.filter((item) =>
    //    item.toLowerCase().includes(query.toLowerCase())
    //  );
    //  setFilteredItems(results);
    //  setIsDropdownOpen(true);
    //} else {
    //  setIsDropdownOpen(false);
    //}
  }, [query, items]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced API call
     const debouncedAfterInput = useCallback(
      
      debounce((searchValue) => {
       console.log('input', query);
       dispatch(searchSuggestions(searchValue));
      }, 1000),
      []
    );

  const handleInput = (e) => {
    const value = e.target.value;
    setQuery(value);
    value ? setIsDropdownOpen(true): setIsDropdownOpen(false);
    dispatch(suggestionsInputTime());
    value && debouncedAfterInput(value);
  }

  const handleSelectItem = (item) => {
    
    setIsDropdownOpen(false);
    //onSelect(item);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      handleSelectItem(suggestions[selectedIndex]);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto" ref={dropdownRef}>
      <input
        type="text"
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search items..."
        value={query}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
      />
      {isDropdownOpen && (
        <ul className="absolute left-0 w-full mt-1 bg-white border border-gray-300 shadow-lg rounded-md max-h-[80vh] overflow-y-auto">
        {suggestionsLoading?
        <div className="animate-pulse p-3">
            {Array.from({ length: 10 }).map((_, index) => (
            <li
                key={index}
                className="px-4 py-3 border mb-1"
            >
            </li>
            ))}
        </div>
        
        :
        <>
          {suggestions.length > 0 ? (
            suggestions.map((item, index) => (
            <Link to={`/products?search=${item}`}>
              <li
                key={item}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                  selectedIndex === index ? "bg-blue-200" : ""
                }`}
                onClick={() => handleSelectItem(item)}
              >
                {item}
              </li>
              </Link>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">No results found</li>
          )}
          </>
        }
        </ul>
      )}
    </div>
  );
};

export default SearchDropdown;
