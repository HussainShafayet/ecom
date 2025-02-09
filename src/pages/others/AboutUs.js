import React from 'react';
import { FaHandshake, FaUsers, FaShoppingCart, FaRegSmile } from 'react-icons/fa';

const AboutUs = () => {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-12">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 via-purple-600 to-blue-500 h-72 md:h-96 rounded-lg overflow-hidden flex items-center justify-center text-white text-center p-4">
        <div className="absolute inset-0 bg-fixed" style={{ backgroundImage: "url('https://cdn.pixabay.com/photo/2014/08/15/06/16/imprint-418594_640.jpg')" }}></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-lg md:text-xl">Our passion drives us to deliver the best online shopping experience for our valued customers.</p>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="bg-gray-50 rounded-lg p-6 md:p-8 text-center shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Story</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Since our inception in 2022, we've been on a mission to make online shopping seamless, accessible, and enjoyable for everyone. Driven by our core values of trust, quality, and customer-centricity, we aim to bring high-quality products and a superior shopping experience.
        </p>
      </section>

      {/* Core Values Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105">
          <FaHandshake size={40} className="text-purple-600 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Integrity</h3>
          <p className="text-gray-600">Building trust with transparency and honesty.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105">
          <FaUsers size={40} className="text-purple-600 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Customer First</h3>
          <p className="text-gray-600">Exceeding customer expectations at every touchpoint.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105">
          <FaShoppingCart size={40} className="text-purple-600 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Innovation</h3>
          <p className="text-gray-600">Constantly evolving to improve our services.</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow transform hover:scale-105">
          <FaRegSmile size={40} className="text-purple-600 mb-4 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Commitment</h3>
          <p className="text-gray-600">Creating positive impact through dedication.</p>
        </div>
      </section>

      {/* Meet the Team Section */}
      {/*<section className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-800">Meet the Team</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">Our team of passionate individuals is dedicated to bringing you an exceptional shopping experience.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {["Alice Johnson", "John Doe", "Jane Smith"].map((name, index) => (
            <div key={index} className="bg-white shadow-lg rounded-lg p-6 text-center transform hover:scale-105 transition-transform">
              <img src="https://via.placeholder.com/150" alt="Team Member" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
              <p className="text-gray-500">{index === 0 ? "CEO & Founder" : index === 1 ? "Head of Marketing" : "Lead Developer"}</p>
            </div>
          ))}
        </div>
      </section>*/}

      {/* Testimonials Section in Grid */}
      <section className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 mb-4">"Fantastic products and wonderful customer service! Highly recommend."</p>
            <h3 className="text-lg font-semibold text-gray-800">Emily R.</h3>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 mb-4">"The product quality is top-notch, and the delivery is always prompt."</p>
            <h3 className="text-lg font-semibold text-gray-800">Michael W.</h3>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-gray-600 mb-4">"A great shopping experience with a wide selection and excellent support."</p>
            <h3 className="text-lg font-semibold text-gray-800">Sarah L.</h3>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
