import React from 'react';
import {NavBar,Footer} from '../layout';
import {BackToTop} from '../common';

const Layout = ({children}) => {
  return (
    <>
    <div className="flex flex-col">
      <NavBar />
      <div className="flex flex-grow min-h-screen">
        <main className={`flex-grow p-4 w-full`}>
          {children}
        </main>
      </div>
      <Footer />

      <BackToTop /> {/* Add the BackToTop component here */}
    </div>
    </>
  )
}

export default Layout;
