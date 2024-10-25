 import React, {useState} from "react";

 const Accordion = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);
  
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <div 
          onClick={() => setIsOpen(!isOpen)} 
          className="font-semibold text-lg flex justify-between items-center cursor-pointer"
        >
          <span>{title}</span>
          <span>{isOpen ? '-' : '+'}</span>
        </div>
        {isOpen && <div className="mt-4">{children}</div>}
      </div>
    );
  };

  export default Accordion;