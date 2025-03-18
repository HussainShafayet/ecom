import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaClock } from 'react-icons/fa';

const Contact = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-8 lg:mb-10">Get in Touch with Us</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Contact Form */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg rounded-lg p-6 md:p-8 text-white">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">Send Us a Message</h2>
          <form>
            <div className="mb-3">
              <label htmlFor="name" className="block mb-1 font-medium">Name</label>
              <div className="flex items-center bg-white rounded-lg px-3 py-2">
                <input
                  type="text"
                  id="name"
                  className="w-full px-2 py-1 text-gray-700 focus:outline-none"
                  placeholder="Your name"
                />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="block mb-1 font-medium">Email</label>
              <div className="flex items-center bg-white rounded-lg px-3 py-2">
                <input
                  type="email"
                  id="email"
                  className="w-full px-2 py-1 text-gray-700 focus:outline-none"
                  placeholder="Your email"
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block mb-1 font-medium">Message</label>
              <textarea
                id="message"
                rows="4"
                className="w-full px-3 py-2 text-gray-700 bg-white rounded-lg focus:outline-none"
                placeholder="Your message"
              ></textarea>
            </div>
            <button className="w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 rounded-lg transition duration-300">
              Send Message
            </button>
          </form>
        </div>

        {/* Company Info and Social Links */}
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6 text-gray-800">Contact Information</h2>
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-start space-x-3">
              <FaMapMarkerAlt className="text-blue-500 text-lg md:text-xl" />
              <p className="text-gray-700">123 E-commerce St., Shop City, EC 12345</p>
            </div>
            <div className="flex items-start space-x-3">
              <FaPhoneAlt className="text-blue-500 text-lg md:text-xl" />
              <p className="text-gray-700">+1 (555) 123-4567</p>
            </div>
            <div className="flex items-start space-x-3">
              <FaEnvelope className="text-blue-500 text-lg md:text-xl" />
              <p className="text-gray-700">support@ecommerce.com</p>
            </div>
            <div className="flex items-start space-x-3">
              <FaClock className="text-blue-500 text-lg md:text-xl" />
              <p className="text-gray-700">Mon - Fri: 9:00 AM - 6:00 PM</p>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="mt-6 lg:mt-10">
            <h3 className="text-lg font-semibold mb-2 md:mb-4">Follow Us</h3>
            <div className="flex space-x-4 md:space-x-6 text-gray-500">
              <a href="https://www.facebook.com/share/1Dvz2bd5J8/" className="hover:text-blue-500 transition-colors"><FaFacebook size={22} /></a>
              <a href="https://www.instagram.com/gocartbd/" className="hover:text-blue-500 transition-colors"><FaInstagram size={22} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* Google Maps Embed */}
      <div className="mt-10 lg:mt-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4 md:mb-6 text-gray-800">Our Location</h2>
        <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345091676!2d144.9537363158543!3d-37.81627944202112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf577cacc7f69f1e4!2sE-commerce+St%2C+Shop+City%2C+VIC+3000%2C+Australia!5e0!3m2!1sen!2sus!4v1614147491227!5m2!1sen!2sus"
            width="100%"
            height="100%"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Contact;


