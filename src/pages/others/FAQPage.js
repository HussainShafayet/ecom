
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaHeadset, FaSearch } from 'react-icons/fa';

const FAQPage = () => {
  const [openQuestionIndex, setOpenQuestionIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqData = [
    { category: "Orders", question: "What is your return policy?", answer: "You can return any product within 30 days of purchase. The product must be unused and in original packaging. Please contact support for further assistance." },
    { category: "Shipping", question: "How long does shipping take?", answer: "Shipping times vary depending on your location. Typically, orders are delivered within 5-7 business days." },
    { category: "Payments", question: "What payment methods do you accept?", answer: "We accept Visa, MasterCard, American Express, PayPal, and other secure payment methods." },
    { category: "Orders", question: "Can I change my order after placing it?", answer: "Once an order is placed, it cannot be modified. However, you may cancel the order within an hour by contacting our support team." },
    { category: "Shipping", question: "Do you offer international shipping?", answer: "Yes, we offer international shipping to select countries. Please check our shipping policy for more details." },
  ];

  const toggleQuestion = (index) => {
    setOpenQuestionIndex(openQuestionIndex === index ? null : index);
  };

  const filteredFaqs = faqData.filter(faq => faq.question.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-12">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-700 via-purple-600 to-blue-500 h-64 md:h-80 rounded-lg overflow-hidden flex items-center justify-center text-white text-center p-4">
        <div className="absolute inset-0 bg-fixed" style={{ backgroundImage: "url('https://via.placeholder.com/1500x600')" }}></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:border-blue-500 outline-none"
        />
        <FaSearch className="absolute top-3 left-3 text-gray-400" size={20} />
      </div>

      {/* FAQ Section with Categories */}
      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Browse by Category</h2>
        <div className="space-y-4 max-w-2xl mx-auto">
          {["Orders", "Shipping", "Payments"].map((category) => (
            <div key={category}>
              <h3 className="text-xl font-semibold text-blue-700 border-b border-gray-200 py-2">{category}</h3>
              {filteredFaqs
                .filter((faq) => faq.category === category)
                .map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg shadow-sm mb-3">
                    <button
                      onClick={() => toggleQuestion(index)}
                      className="w-full flex items-center justify-between p-4 text-left text-gray-800 font-semibold focus:outline-none transition-all"
                    >
                      <span>{faq.question}</span>
                      {openQuestionIndex === index ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    {openQuestionIndex === index && (
                      <div className="p-4 text-gray-600 bg-gray-50 transition-all duration-500 ease-in-out">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 md:p-8 text-center text-white shadow-lg space-y-4">
        <h3 className="text-2xl font-bold">Still have questions?</h3>
        <p className="text-lg">If you didn’t find the answer you were looking for, feel free to contact our support team.</p>
        <a href="/contact" className="bg-white text-blue-600 font-semibold py-2 px-6 rounded-lg inline-flex items-center space-x-2 hover:bg-gray-100 transition-colors">
          <FaHeadset /> <span>Contact Support</span>
        </a>
      </section>
    </div>
  );
};

export default FAQPage;

