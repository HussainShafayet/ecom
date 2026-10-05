import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavBar, Footer, TrustBadgeBar, SessionExpiredBanner, OfflineBanner } from '../layout';
import Toaster from '../common/Toaster';
import BackToTop from '../common/BackToTop';
import {BottomNav} from '../common';
import { handleFetchSite, selectSite } from '../../redux/slice/siteSlice';
import { selectPageTitle } from '../../redux/slice/pageTitleSlice';
import { documentTitle } from '../../utils/pageTitle';

const Layout = ({ children, scrollContainerRef}) => {
  const dispatch = useDispatch();
  const { name, tagline } = useSelector(selectSite);
  const pageTitle = useSelector(selectPageTitle);

  // The shop's identity (header, footer, contact page) is read once, when the storefront opens
  useEffect(() => {
    dispatch(handleFetchSite());
  }, [dispatch]);

  // The browser tab carries the page's name (`usePageTitle`) and the shop's; this is the only place that writes it. Until there is something
  // to say (no shop name yet, no page name) the title the HTML came with stays
  useEffect(() => {
    const title = documentTitle({ page: pageTitle, name, tagline });
    if (title) document.title = title;
  }, [pageTitle, name, tagline]);

  return (
    <div ref={scrollContainerRef} className="flex flex-col h-screen overflow-y-auto scrollbar-custom">
      <NavBar />
      <OfflineBanner />
      <SessionExpiredBanner />
      <TrustBadgeBar />
      <div className="flex-grow">
        <main className="container pt-4 w-full mx-auto min-h-screen p-2">
          {children}
        </main>
      </div>
      <BottomNav />
      <Toaster />
      <Footer className="shadow-lg" />
      
      {/* Pass the scrollable container ref to BackToTop */}
      <BackToTop scrollContainerRef={scrollContainerRef} />
    </div>
  );
};

export default Layout;




