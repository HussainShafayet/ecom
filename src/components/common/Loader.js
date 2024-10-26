import React from 'react';

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-full space-x-2">
       <div className="w-8 h-8 bg-blue-500 animate-spinning-cube"></div>
    </div>
  );
};

export default Loader;
