import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { ErrorDisplay, SocialLinks, SuccessMessage } from '../../components/common';
import { selectSite } from '../../redux/slice/siteSlice';
import { sendContactMessage } from '../../services/siteService';
import { errorMessages } from '../../utils/errorMessages';

const EMPTY_FORM = { name: '', email: '', phone: '', subject: '', message: '' };
const FIELD = 'w-full px-2 py-1 text-gray-700 focus:outline-none';

// The shop's details come from the admin (Site settings); the form stores a message the staff read in the admin.
const Contact = () => {
  const { contact, social_links } = useSelector(selectSite);
  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState([]);
  const [sent, setSent] = useState('');

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setErrors([]);
    setSent('');
    try {
      const response = await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setSent(response?.data?.message || 'Thank you. We have your message.');
      setForm(EMPTY_FORM);
    } catch (error) {
      setErrors(errorMessages(error));
    } finally {
      setSending(false);
    }
  };

  const details = [
    { key: 'address', Icon: FaMapMarkerAlt, text: contact.address },
    { key: 'phone', Icon: FaPhoneAlt, text: contact.phone },
    { key: 'email', Icon: FaEnvelope, text: contact.email },
    { key: 'hours', Icon: FaClock, text: contact.opening_hours },
  ].filter((detail) => detail.text);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-8 lg:mb-10">Get in Touch with Us</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Contact Form */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg rounded-lg p-6 md:p-8 text-white">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">Send Us a Message</h2>
          <SuccessMessage message={sent} />
          <ErrorDisplay errors={errors} />
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="block mb-1 font-medium">Name</label>
              <div className="flex items-center bg-white rounded-lg px-3 py-2">
                <input type="text" id="name" name="name" required maxLength={100} value={form.name} onChange={change} className={FIELD} placeholder="Your name" />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="block mb-1 font-medium">Email</label>
              <div className="flex items-center bg-white rounded-lg px-3 py-2">
                <input type="email" id="email" name="email" required maxLength={254} value={form.email} onChange={change} className={FIELD} placeholder="Your email" />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="phone" className="block mb-1 font-medium">Phone (optional)</label>
              <div className="flex items-center bg-white rounded-lg px-3 py-2">
                <input type="tel" id="phone" name="phone" maxLength={30} value={form.phone} onChange={change} className={FIELD} placeholder="Your phone number" />
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="subject" className="block mb-1 font-medium">Subject (optional)</label>
              <div className="flex items-center bg-white rounded-lg px-3 py-2">
                <input type="text" id="subject" name="subject" maxLength={150} value={form.subject} onChange={change} className={FIELD} placeholder="What is it about?" />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block mb-1 font-medium">Message</label>
              <textarea
                id="message"
                name="message"
                rows="4"
                required
                minLength={5}
                maxLength={2000}
                value={form.message}
                onChange={change}
                className="w-full px-3 py-2 text-gray-700 bg-white rounded-lg focus:outline-none"
                placeholder="Your message"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full bg-purple-700 hover:bg-purple-800 disabled:opacity-60 disabled:cursor-wait text-white font-semibold py-3 rounded-lg transition duration-300"
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Company Info and Social Links */}
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6 text-gray-800">Contact Information</h2>
          <div className="space-y-4 md:space-y-6">
            {details.map(({ key, Icon, text }) => (
              <div key={key} className="flex items-start space-x-3">
                <Icon className="text-blue-500 text-lg md:text-xl" />
                <p className="text-gray-700">{text}</p>
              </div>
            ))}
            {details.length === 0 && <p className="text-gray-600">Send us a message and we will get back to you.</p>}
          </div>

          {social_links.length > 0 && (
            <div className="mt-6 lg:mt-10">
              <h3 className="text-lg font-semibold mb-2 md:mb-4">Follow Us</h3>
              <SocialLinks links={social_links} size={22} className="md:space-x-2 text-gray-500" linkClassName="hover:text-blue-500 transition-colors" />
            </div>
          )}
        </div>
      </div>

      {/* Map: only when the admin gave one */}
      {contact.map_url && (
        <div className="mt-10 lg:mt-12">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-4 md:mb-6 text-gray-800">Our Location</h2>
          <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden shadow-md">
            <iframe
              title="Our location"
              src={contact.map_url}
              width="100%"
              height="100%"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contact;
