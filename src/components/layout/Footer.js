import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto text-center">
        <p>&copy; 2024 Ecom. All rights reserved.</p>
        <ul className="flex justify-center space-x-4 mt-4">
          <li><a href="/terms" className="hover:text-gray-400">Terms of Service</a></li>
          <li><a href="/privacy" className="hover:text-gray-400">Privacy Policy</a></li>
          <li><a href="/contact" className="hover:text-gray-400">Contact Us</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
