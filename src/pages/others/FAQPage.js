import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp, FaHeadset, FaSearch } from 'react-icons/fa';
import { Loader } from '../../components/common';
import { getFaqs } from '../../services/siteService';
import usePageTitle from '../../hooks/usePageTitle';

// The questions come from the admin (Site > FAQ); they are grouped by category in the order the admin arranged them.
const FAQPage = () => {
  usePageTitle('FAQ');
  const [faqs, setFaqs] = useState(null); // null while loading
  const [failed, setFailed] = useState(false);
  const [openKey, setOpenKey] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let current = true;
    getFaqs()
      .then((response) => { if (current) setFaqs(response?.data?.data?.faqs || []); })
      .catch(() => { if (current) { setFaqs([]); setFailed(true); } });
    return () => { current = false; };
  }, []);

  const query = searchQuery.trim().toLowerCase();
  const matching = (faqs || []).filter((faq) => (
    !query || faq.question.toLowerCase().includes(query) || faq.answer.toLowerCase().includes(query)
  ));
  const categories = [...new Set(matching.map((faq) => faq.category))];

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-12">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 via-purple-600 to-blue-500 h-64 md:h-80 rounded-lg overflow-hidden flex items-center justify-center text-white text-center p-4">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg md:text-xl">Find quick answers to your questions below.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-lg mx-auto relative mt-4">
        <input
          type="text"
          placeholder="Search FAQs..."
          aria-label="Search FAQs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
        />
        <FaSearch className="absolute top-3 left-3 text-gray-400" size={20} />
      </div>

      {/* FAQ Section with Categories */}
      <section className="space-y-6">
        {faqs === null && <Loader message="Loading questions" />}
        {failed && <p role="alert" className="text-center text-red-600">The questions could not be loaded. Please try again in a moment.</p>}
        {faqs !== null && !failed && faqs.length === 0 && (
          <p className="text-center text-gray-600">There are no questions here yet.</p>
        )}
        {faqs !== null && faqs.length > 0 && matching.length === 0 && (
          <p className="text-center text-gray-600">No question matches &quot;{searchQuery.trim()}&quot;.</p>
        )}
        <div className="space-y-4 max-w-2xl mx-auto">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-xl font-semibold text-blue-700 border-b border-gray-200 py-2">{category}</h3>
              {matching
                .filter((faq) => faq.category === category)
                .map((faq) => {
                  const key = `${category}|${faq.question}`;
                  const isOpen = openKey === key;
                  return (
                    <div key={key} className="border border-gray-200 rounded-lg shadow-sm mb-3">
                      <button
                        onClick={() => setOpenKey(isOpen ? null : key)}
                        aria-expanded={isOpen}
                        className="w-full flex items-center justify-between p-4 text-left text-gray-800 font-semibold focus:outline-none transition-all"
                      >
                        <span>{faq.question}</span>
                        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </button>
                      {isOpen && (
                        <div className="p-4 text-gray-600 bg-gray-50 whitespace-pre-line">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 md:p-8 text-center text-white shadow-lg space-y-4">
        <h3 className="text-2xl font-bold">Still have questions?</h3>
        <p className="text-lg">If you didn’t find the answer you were looking for, feel free to contact our support team.</p>
        <Link to="/contact" className="bg-white text-blue-600 font-semibold py-2 px-6 rounded-lg inline-flex items-center space-x-2 hover:bg-gray-100 transition-colors">
          <FaHeadset /> <span>Contact Support</span>
        </Link>
      </section>
    </div>
  );
};

export default FAQPage;
