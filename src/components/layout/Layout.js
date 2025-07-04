import React, { useRef } from 'react';
import { NavBar, Footer } from '../layout';
import BackToTop from '../common/BackToTop';
import {BottomNav} from '../common';

const Layout = ({ children, scrollContainerRef}) => {

  return (
    <div ref={scrollContainerRef} className="flex flex-col h-screen overflow-y-auto scrollbar-custom">
      <NavBar />
      <div className="flex-grow">
        <main className="container pt-4 w-full mx-auto min-h-screen p-2">
          {children}
        </main>
      </div>
      <BottomNav />
      <Footer className="shadow-lg" />
      
      {/* Pass the scrollable container ref to BackToTop */}
      <BackToTop scrollContainerRef={scrollContainerRef} />
    </div>
  );
};

export default Layout;




