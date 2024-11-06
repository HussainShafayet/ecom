import React, { useRef } from 'react';
import { NavBar, Footer } from '../layout';
import BackToTop from '../common/BackToTop';

const Layout = ({ children, scrollContainerRef}) => {

  return (
    <div ref={scrollContainerRef} className="flex flex-col h-screen overflow-y-auto scrollbar-custom">
      <NavBar />
      <div className="flex-grow">
        <main className="p-4 w-full mx-auto">
          {children}
        </main>
      </div>
      <Footer className="shadow-lg" />
      
      {/* Pass the scrollable container ref to BackToTop */}
      <BackToTop scrollContainerRef={scrollContainerRef} />
    </div>
  );
};

export default Layout;




