import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = () => {
  const location = useLocation();
  
  // Split the pathname into parts and remove empty strings
  const pathParts = location.pathname.split('/').filter(part => part);

  return (
    <div className="text-gray-600 text-xs sm:text-sm p-1 flex flex-wrap items-center">
      {/* Home Link */}
      <Link to="/" className="text-blue-500 hover:underline cursor-pointer">Home</Link>
      
      {/* Map through the path parts to create breadcrumb links */}
      {pathParts.map((part, index) => {
        const pathTo = `/${pathParts.slice(0, index + 1).join('/')}`;

        // Check if this is the last item in the path
        const isLast = index === pathParts.length - 1;

        return (
          <span key={index} className="flex items-center">
            {/* Separator */}
            <span className="mx-1"> &gt; </span>
            
            {isLast ? (
              // Display the current page name without a link
              <span className="text-gray-700 font-semibold capitalize">{part.replace(/-/g, ' ')}</span>
            ) : (
              // Create clickable links for previous paths
              <Link to={pathTo} className="text-blue-500 hover:underline cursor-pointer capitalize">
                {part.replace(/-/g, ' ')}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
