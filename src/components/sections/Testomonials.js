import React from 'react';
import { FaStar } from 'react-icons/fa';
import {Link} from 'react-router-dom';

const Testimonials = () => {
  // Demo reviews
  const reviews = [
    {
      id: 1,
      name: 'John Doe',
      photoUrl: 'https://via.placeholder.com/80',
      rating: 5,
      quote: 'Absolutely love it! The quality exceeded my expectations, and delivery was super fast!',
    },
    {
      id: 2,
      name: 'Jane Smith',
      photoUrl: 'https://via.placeholder.com/80',
      rating: 4,
      quote: 'Great product, exactly as described. Customer service was very responsive and helpful!',
    },
    {
      id: 3,
      name: 'Emily Johnson',
      photoUrl: 'https://via.placeholder.com/80',
      rating: 5,
      quote: 'I am so happy with my purchase! Highly recommend this store to everyone.',
    },
    {
      id: 4,
      name: 'Michael Lee',
      photoUrl: 'https://via.placeholder.com/80',
      rating: 4,
      quote: 'The product quality is excellent! I would definitely buy from here again.',
    }
  ];

  return (
    <div className="container mx-auto my-12">
      <h2 className="text-3xl font-bold">What Our Customers Say</h2>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
        <span className="text-sm md:text-base text-gray-600">
          Discover what Our Customers Say.
        </span>
        <Link
          to="/products"
          className="underline text-blue-500 hover:text-blue-600 text-sm md:text-base"
        >
          View All
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="p-6 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300">
            
            {/* Customer Photo */}
            <div className="flex justify-center mb-4">
              <img
                src={review.photoUrl}
                alt={`${review.name}'s photo`}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
              />
            </div>

            {/* Customer Rating */}
            <div className="flex justify-center items-center mb-2">
              {[...Array(5)].map((_, index) => (
                <FaStar
                  key={index}
                  className={index < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>

            {/* Customer Quote */}
            <p className="text-gray-700 italic text-center mb-4">"{review.quote}"</p>

            {/* Customer Name */}
            <p className="text-center font-semibold text-gray-900">- {review.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
