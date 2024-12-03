import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto my-10 px-4 md:px-8 lg:px-16">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Privacy Policy</h1>
      <p className="text-gray-600 mb-4 text-center">
        Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.
      </p>

      {/* Introduction Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Personal Information: Your name, email address, phone number, and shipping address.</li>
          <li>Payment Information: Credit card details and payment processing information.</li>
          <li>Browsing Data: IP address, browser type, and activity on our site.</li>
          <li>Cookies: To enhance user experience and track website usage.</li>
        </ul>
      </section>

      {/* How We Use Information */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>To process and deliver your orders.</li>
          <li>To provide customer support and respond to inquiries.</li>
          <li>To send promotional emails or newsletters (with your consent).</li>
          <li>To analyze website performance and improve user experience.</li>
        </ul>
      </section>

      {/* Data Sharing */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">3. Sharing Your Information</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>We do not sell or share your personal data with third parties, except when necessary for order fulfillment (e.g., delivery services).</li>
          <li>Your payment details are handled securely by trusted third-party payment processors.</li>
          <li>We may disclose your information to comply with legal obligations.</li>
        </ul>
      </section>

      {/* Cookies Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. Cookies and Tracking Technologies</h2>
        <p className="text-gray-700 mb-2">
          We use cookies to personalize your shopping experience, analyze traffic, and improve our services. You can control cookie settings through your browser.
        </p>
      </section>

      {/* Security Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">5. How We Protect Your Data</h2>
        <p className="text-gray-700">
          We use advanced encryption technologies and secure servers to protect your data. However, no system is completely secure, and we encourage you to safeguard your account credentials.
        </p>
      </section>

      {/* Rights Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">6. Your Rights</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>You have the right to access, update, or delete your personal information.</li>
          <li>You can opt out of marketing communications at any time.</li>
          <li>For any data requests, please contact us at <span className="text-blue-600 underline">support@example.com</span>.</li>
        </ul>
      </section>

      {/* Updates Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">7. Updates to This Policy</h2>
        <p className="text-gray-700">
          We may update this Privacy Policy to reflect changes in our practices or legal requirements. Any updates will be posted on this page.
        </p>
      </section>

      {/* Contact Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>
        <p className="text-gray-700">
          If you have any questions about this Privacy Policy, please contact us at <span className="text-blue-600 underline">support@example.com</span>.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
