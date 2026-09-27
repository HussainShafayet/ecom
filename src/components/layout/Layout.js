import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavBar, Footer } from '../layout';
import BackToTop from '../common/BackToTop';
import {BottomNav} from '../common';
import { handleFetchSite, selectSite } from '../../redux/slice/siteSlice';

const Layout = ({ children, scrollContainerRef}) => {
  const dispatch = useDispatch();
  const { name, tagline } = useSelector(selectSite);

  // The shop's identity (header, footer, contact page) is read once, when the storefront opens
  useEffect(() => {
    dispatch(handleFetchSite());
  }, [dispatch]);

  // The browser tab carries the shop's name; until the answer arrives the page's own title stays
  useEffect(() => {
    if (name) document.title = tagline ? `${name} | ${tagline}` : name;
  }, [name, tagline]);

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




