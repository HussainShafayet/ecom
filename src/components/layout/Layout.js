import React from 'react';
import {NavBar,Footer} from '../layout';

const Layout = ({children}) => {
  return (
    <>
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex flex-grow">
        <main className={`flex-grow p-4 w-full`}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
    </>
  )
}

export default Layout;
