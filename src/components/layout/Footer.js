import React from 'react';
import {useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import {selectSite} from '../../redux/slice/siteSlice';
import SocialLinks from '../common/SocialLinks';
import NewsletterForm from './NewsletterForm';

const LINK = 'hover:text-gray-100 transition';

const Footer = () => {
  const {isAuthenticated} = useSelector((state)=> state.auth);
  const {name, tagline, social_links, footer_pages} = useSelector(selectSite);
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        
        <NewsletterForm />

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          
          {/* Company Info: the pages the admin put here, then the contact page */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              {footer_pages.company.map((page) => (
                <li key={page.slug}><Link to={`/pages/${page.slug}`} className={LINK}>{page.title}</Link></li>
              ))}
              <li><Link to="/contact" className={LINK}>Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link to="/faq" className={LINK}>FAQ</Link></li>
              {footer_pages.service.map((page) => (
                <li key={page.slug}><Link to={`/pages/${page.slug}`} className={LINK}>{page.title}</Link></li>
              ))}
            </ul>
          </div>
          
          {/* My Account */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">My Account</h3>
            <ul className="space-y-2">
              {isAuthenticated? 
                <>
                  <li><Link to="/profile" className={LINK}>Profile</Link></li>
                  <li><Link to="/orders" className={LINK}>My Orders</Link></li>
                </>
              :
              <li><Link to="/signin" className={LINK}>Sign In</Link></li>
              }
              <li><Link to="/order-tracking" className={LINK}>Order Tracking</Link></li>
              <li><Link to="/wishlist" className={LINK}>Wishlist</Link></li>
              <li><Link to="/cart" className={LINK}>Shopping Cart</Link></li>
            </ul>
          </div>
          
          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Stay Connected</h3>
            {tagline && <p className="mb-4 text-gray-400">{tagline}</p>}
            <SocialLinks links={social_links} className="text-gray-400" linkClassName={LINK} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 border-t border-gray-700 pt-6 text-sm text-gray-400 text-center">
          {name && <p>&copy; {new Date().getFullYear()} {name}. All rights reserved.</p>}
          {footer_pages.legal.length > 0 && (
            <p className="mt-2">
              {footer_pages.legal.map((page, index) => (
                <React.Fragment key={page.slug}>
                  {index > 0 && '|'}
                  <Link to={`/pages/${page.slug}`} className="hover:text-gray-100 mx-2">{page.title}</Link>
                </React.Fragment>
              ))}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
