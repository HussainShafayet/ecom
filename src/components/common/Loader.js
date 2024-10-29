import React from 'react';

const Loader = ({message="Loading"}) => {
  return (
    <div className={`w-full font-semibold cursor-wait`}>
      <span className="flex items-center justify-center space-x-2">
        <span className="animate-spin h-6 w-6 border-t-2 border-b-2 border-yellow-600 rounded-full"></span>
        <span>{message}...</span>
      </span>
    </div>
  );
};

export default Loader;
