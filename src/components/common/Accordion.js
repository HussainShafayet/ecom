 import React, {useState} from "react";
import {FaChevronDown} from "react-icons/fa";

 const Accordion = ({ title, children ,icon}) => {
    const [isOpen, setIsOpen] = useState(true);
  
    return (
        <div className="border-b border-gray-200 pb-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full py-2 text-gray-700 font-semibold"
        >
          <div className="flex items-center">
            {icon} <span className="ml-2">{title}</span>
          </div>
          <FaChevronDown className={`transform ${isOpen ? 'rotate-180' : ''} transition-transform`} />
        </button>
        <div className={`mt-2 ${isOpen ? 'block' : 'hidden'} transition-all duration-300`}>
          {children}
        </div>
      </div>
    );
  };

  export default Accordion;