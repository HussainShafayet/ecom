import {debounce} from "lodash";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {useDispatch, useSelector} from "react-redux";
import {searchSuggestions, suggestionsInputTime} from "../../redux/slice/productSlice";
import {Link, useNavigate} from "react-router-dom";

const SearchDropdown = () => {
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {suggestionsLoading, suggestions, suggestionsError} = useSelector((state)=> state.product);
  const searchError = useSelector((state) => state.globalError.sectionErrors["search-suggestions"]);

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
      dispatch(searchSuggestions(searchValue));
    }, 1000),
    [dispatch] // Add dispatch as a dependency
  );

  const handleInput = (e) => {
    const value = e.target.value;
  
    setQuery(value);
  
    if (value) {
      setIsDropdownOpen(true);
      dispatch(suggestionsInputTime());
      debouncedAfterInput(value);
    } else {
      debouncedAfterInput.cancel(); // Cancel debounce when input is cleared
    }
  };

  const handleSelectItem = (item) => {
    setQuery(item);
    setIsDropdownOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      handleSelectItem(suggestions[selectedIndex]);
      navigate(`/products?search=${suggestions[selectedIndex]}`);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search products..."
        value={query}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={()=>setIsDropdownOpen(true)}
      />
      {isDropdownOpen && (
        <ul className="absolute left-0 w-full mt-1 bg-white border border-gray-300 shadow-lg rounded-md max-h-[80vh] overflow-y-auto">
        {suggestionsLoading && suggestions.length === 0 ?
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
          {(searchError || suggestionsError) ? <div className="text-center text-red-500 font-semibold py-4">
            {searchError || suggestionsError} - Please try again later.
          </div>:
          <>
            {suggestions.length > 0 ? (
              suggestions?.map((item, index) => (
              <Link to={`/products?search=${item}`} key={item}>
                <li
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
        </>
         }
        </ul>
      )}
    </div>
  );
};

export default SearchDropdown;
