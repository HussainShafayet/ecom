import React, { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { subscribeToNewsletter } from '../../services/siteService';
import { errorMessages } from '../../utils/errorMessages';

// The footer's newsletter box. The backend answers the same sentence for a new address and one it already had.
const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | failed
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const address = email.trim();
    if (!address || status === 'sending') return;
    setStatus('sending');
    try {
      const response = await subscribeToNewsletter(address);
      setMessage(response?.data?.message || 'Thank you for subscribing.');
      setStatus('done');
      setEmail('');
    } catch (error) {
      setMessage(errorMessages(error)[0]);
      setStatus('failed');
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-700 to-purple-700 rounded-lg p-6 mb-8 text-center text-gray-100 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Stay Updated with Our Latest Offers!</h2>
      <p className="text-gray-200 mb-4">Subscribe to our newsletter and receive exclusive deals right in your inbox.</p>
      <form className="flex justify-center items-center max-w-md mx-auto" onSubmit={handleSubmit}>
        <input
          type="email"
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          aria-label="Your email address"
          className="w-full px-4 py-2 rounded-l-md focus:outline-none text-gray-700"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          aria-label="Subscribe"
          className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 disabled:cursor-wait text-white px-4 py-2 rounded-r-md transition-all"
        >
          <FaEnvelope />
        </button>
      </form>
      {status === 'done' && <p role="status" className="mt-3 text-green-200 text-sm">{message}</p>}
      {status === 'failed' && <p role="alert" className="mt-3 text-red-200 text-sm">{message}</p>}
    </div>
  );
};

export default NewsletterForm;
