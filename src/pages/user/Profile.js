import React, { useEffect, useState } from 'react';
import { FaUserEdit, FaBoxOpen, FaMapMarkerAlt, FaCreditCard, FaLock, FaPlus, FaHeart, FaBell, FaHistory, FaCamera } from 'react-icons/fa';
import {useDispatch} from 'react-redux';
import {getUser} from '../../redux/slice/authSlice';

const Profile = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const dispatch = useDispatch();
  useEffect(()=>{
    dispatch(getUser());
  }, [dispatch])
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-sm opacity-80">Manage your personal information, orders, and account settings.</p>
        </div>

        {/* Tabs for Profile Sections */}
        <div className="flex flex-wrap justify-around md:justify-start bg-white border-b text-gray-700 overflow-x-auto">
          {[
            { label: 'Account Overview', icon: <FaUserEdit />, id: 'overview' },
            { label: 'Order History', icon: <FaBoxOpen />, id: 'orders' },
            { label: 'Address Book', icon: <FaMapMarkerAlt />, id: 'address' },
            { label: 'Payment Methods', icon: <FaCreditCard />, id: 'payment' },
            { label: 'Security Settings', icon: <FaLock />, id: 'security' },
            { label: 'Wishlist', icon: <FaHeart />, id: 'wishlist' },
            { label: 'Notifications', icon: <FaBell />, id: 'notifications' },
            { label: 'Recent Activity', icon: <FaHistory />, id: 'activity' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex-1 md:flex-none px-6 py-4 font-medium hover:text-blue-600 transition-colors ${
                selectedTab === tab.id ? 'border-b-4 border-blue-600 text-blue-600 font-semibold' : 'border-b-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Content Section */}
        <div className="p-6">
        {selectedTab === 'overview' && (
            <div className="rounded-lg bg-gray-100 p-6 shadow-md flex flex-col md:flex-row gap-6">
              {/* Profile Image Section */}
              <div className="flex-shrink-0 relative w-32 h-32 mx-auto md:mx-0 rounded-full overflow-hidden bg-gray-200 shadow-md">
                <img
                  src="https://img.freepik.com/premium-photo/stylish-man-flat-vector-profile-picture-ai-generated_606187-310.jpg" // Placeholder for the profile image
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
                <button className="absolute bottom-0 right-12 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                  <FaCamera />
                </button>
              </div>

              {/* Personal Information Card */}
              <div className="flex-1 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
                <p className="mb-2"><strong>Name:</strong> John Doe</p>
                <p className="mb-2"><strong>Email:</strong> john.doe@example.com</p>
                <p className="mb-2"><strong>Phone:</strong> +1 234 567 890</p>
                <p className="mb-2"><strong>Date of Birth:</strong> Jan 15, 1990</p>
                <p className="mb-2"><strong>Gender:</strong> Male</p>
                <p className="mb-2"><strong>Address:</strong> 123 Main Street, New York, NY</p>
                <button className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                  Edit Information
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Order History</h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <p><strong>Order ID:</strong> #12345</p>
                  <p><strong>Date:</strong> Oct 10, 2023</p>
                  <p><strong>Total:</strong> $99.99</p>
                  <p><strong>Status:</strong> Shipped</p>
                  <p><strong>Items:</strong></p>
                  <ul className="list-disc ml-5 text-gray-700">
                    <li>Product 1 - $29.99</li>
                    <li>Product 2 - $39.99</li>
                    <li>Product 3 - $29.99</li>
                  </ul>
                  <button className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'address' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Address Book</h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <p><strong>Home Address:</strong></p>
                  <p>123 Main Street, Apt 4B, New York, NY, 10001</p>
                  <p><strong>Type:</strong> Home</p>
                  <button className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                    Edit Address
                  </button>
                </div>
                <button className="flex items-center gap-2 mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
                  <FaPlus /> Add New Address
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'payment' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <p><strong>Visa</strong> ending in 1234</p>
                  <p><strong>Expiry Date:</strong> 12/24</p>
                  <p><strong>Billing Address:</strong> 123 Main Street, New York, NY</p>
                  <button className="mt-3 w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                    Remove Card
                  </button>
                </div>
                <button className="flex items-center gap-2 mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
                  <FaPlus /> Add New Card
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <p><strong>Password:</strong> ••••••••</p>
                <button className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                  Change Password
                </button>
                <p className="mt-6"><strong>Two-Factor Authentication:</strong> Enabled</p>
                <p><strong>Last Login:</strong> Oct 13, 2023, 2:30 PM</p>
              </div>
            </div>
          )}

          {selectedTab === 'wishlist' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">My Wishlist</h2>
              <p className="text-gray-500">You haven’t added any items to your wishlist yet.</p>
            </div>
          )}

          {selectedTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-3">
                <div>
                  <label className="inline-flex items-center">
                    <input type="checkbox" className="form-checkbox text-blue-600" />
                    <span className="ml-2">Order Updates</span>
                  </label>
                </div>
                <div>
                  <label className="inline-flex items-center">
                    <input type="checkbox" className="form-checkbox text-blue-600" />
                    <span className="ml-2">Promotional Emails</span>
                  </label>
                </div>
                <div>
                  <label className="inline-flex items-center">
                    <input type="checkbox" className="form-checkbox text-blue-600" />
                    <span className="ml-2">SMS Notifications</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'activity' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <p className="text-gray-500">No recent activity to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;



