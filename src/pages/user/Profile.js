import React, { useEffect, useState } from 'react';
import { FaUserEdit, FaBoxOpen, FaMapMarkerAlt, FaCreditCard, FaLock, FaPlus, FaHeart, FaBell, FaHistory, FaCamera, FaPlusCircle } from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {getUser} from '../../redux/slice/authSlice';
import {useNavigate} from 'react-router-dom';
import {handleAddressCreate, handleGetAddress, handleGetProfile, handleProfileUpdate} from '../../redux/slice/profileSlice';
import {Loader} from '../../components/common';
import {AddressItem} from '../../components/profile';
import {dhakaCityData, districtsData, divisionsData, upazilasData} from '../../data/location';

const Profile = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const dispatch = useDispatch();
  const {isAuthenticated,user} = useSelector((state)=>state.auth);
  const {isLoading, profile, error, adrressLoading,addresses, addressError} = useSelector((state)=>state.profile);

  const navigate = useNavigate();
  
  //useEffect(() => {
  //  if (!isAuthenticated) {
  //    navigate('/signin');
  //  }
  //}, [isAuthenticated, navigate]);

  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
  const [formData, setFormData] = useState({ ...profile }); // State to store form data

  const [isAddAddress, setIsAddAddress] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    "title": "",
    "shipping_type": "",
    "address": "",
    "area": "",
    "division": "",
    "district": "",
    "thana": ""
});
  const [touched, updateTouched] = useState({});
    const [errors, setErrors] = useState({});
   
    const [districts, setDistricts] = useState([]);
    const [upazillas, setUpazillas] = useState([]);

 
  
  useEffect(()=>{
    dispatch(handleGetProfile());
    dispatch(handleGetAddress());
  }, [dispatch]);

  const handleShowInfoEdit = ()=>{
    setIsEditing(true);
    setFormData({...profile})
  }


   // Handle form input changes
   const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Create a new FormData instance
    const formDataObj = new FormData();

    // Append all form fields to the FormData object
    Object.entries(formData).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });
    //console.log(formDataObj, 'form');
    dispatch(handleProfileUpdate(formDataObj));
    //handleUpdate(formData); // Call parent function to update profile
    setIsEditing(false); // Exit edit mode
  };


  //for address
   // Handle input changes
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAddressFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      };
       const handleBlur = (e) => {
          const { name } = e.target;
          updateTouched({ [name]: true });
      
          // Validate field on blur to show error if empty
          if (!addressFormData[name]?.trim()) {
            setErrors({ ...errors, [name]: `${name} is required` });
          }
        };
      const getLocationType = ()=>{
        if (addressFormData.shipping_type === 'inside_dhaka') {
          return 'md:grid-cols-2'
        }else if(addressFormData.shipping_type === 'outside_dhaka'){
          return 'md:grid-cols-4 sm:grid-cols-2';
        } else {
          return 'grid-cols-1';
        }
      }  
      const handleLocationType= (e) =>{
          const locationType = e.target.value;
          
          locationType && 
          setAddressFormData((prevState) => ({
              ...prevState,
              ['shipping_type']: locationType,
              ['area']: '',
            }));
          
           // Validate field on change and clear error if valid
           if (locationType?.trim()) {
            setErrors({ ...errors, ['shipping_type']: '' });
          }
      
          //isAuthenticated && dispatch(setSelectedAddressId(null));
        }
        const handleDhakaArea = (e) => {
          const area = e.target.value;
          setAddressFormData((prev) => ({
              ...prev,
              area: area,
              division: '',
              district: '',
              thana: '',
            }));
          
          // Validate field on change and clear error if valid
          if (area.trim()) {
          setErrors({ ...errors, ['area']: '' });
          }
          //isAuthenticated && dispatch(setSelectedAddressId(null));
      }
      const handleDivisionChange = (e) => {
          const division = e.target.value;
          const divisionItem = divisionsData.find((item)=> item.name === division);
          if (divisionItem) {
              setAddressFormData((prev) => ({
                  ...prev,
                  division: division,
                  district: '',
                  thana: '',
                }));
              const divisionDist = districtsData.filter((item)=> item.division_id === divisionItem.id);
              
              setDistricts(divisionDist|| []);
              setUpazillas([]);
          }
          
  
          // Validate field on change and clear error if valid
          if (division.trim()) {
              setErrors({ ...errors, ['division']: '' });
          }
      };
  
       const handleDistrictChange = (e) => {
          const district = e.target.value;
          const districtItem = districts.find((item)=> item.name === district);
          if (districtItem) {
              setAddressFormData((prev) => ({
                  ...prev,
                  district: district,
                  thana: '',
                }));
      
            const upzillaDist = upazilasData.filter((item)=> item.district_id === districtItem.id);
            
            setUpazillas(upzillaDist|| []);
          }
           // Validate field on change and clear error if valid
           if (district.trim()) {
            setErrors({ ...errors, ['district']: '' });
          }
        };

        
  const handleAddressSubmit = (e) =>{
    e.preventDefault();
    //console.log(addressFormData, 'address');
    dispatch(handleAddressCreate(addressFormData));
    setIsAddAddress(false);
  }



  if (isLoading) {
    return <div className='container h-screen flex justify-center'><Loader message='Loading Profile' /></div>
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

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
            { label: 'Shipping Addresses', icon: <FaMapMarkerAlt />, id: 'address' },
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
                  src={profile?.profile_picture || "https://img.freepik.com/premium-photo/stylish-man-flat-vector-profile-picture-ai-generated_606187-310.jpg"} // Placeholder for the profile image
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
                
                {!isEditing ? (
                  <>
                    {profile?.name && <p className="mb-2"><strong>Name:</strong> {profile.name}</p>}
                    {profile?.username && <p className="mb-2"><strong>User Name:</strong> {profile?.username}</p>}
                    {profile?.email && <p className="mb-2"><strong>Email:</strong> {profile.email}</p>}
                    {profile?.phone_number && <p className="mb-2"><strong>Phone:</strong> {profile.phone_number}</p>}
                    {profile?.date_of_birth && <p className="mb-2"><strong>Date of Birth:</strong> {profile?.date_of_birth}</p>}
                    {profile?.gender && <p className="mb-2"><strong>Gender:</strong> {profile.gender}</p>}

                    <button
                      onClick={handleShowInfoEdit}
                      className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Edit Information
                    </button>
                  </>
                ) : (
                  <form onSubmit={handleAddressSubmit} className="space-y-4">
                    {/* Editable Name Field */}
                    <div>
                      <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>

                    {/* Editable Username Field */}
                    <div>
                      <label htmlFor="username" className="block text-gray-700 font-medium mb-1">
                        User Name
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>

                    {/* Editable Email Field */}
                    <div>
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>

                    {/* Editable Phone Number Field */}
                    {/*<div>
                      <label htmlFor="phone_number" className="block text-gray-700 font-medium mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>*/}

                    {/* Editable Date of Birth Field */}
                    <div>
                      <label htmlFor="date_of_birth" className="block text-gray-700 font-medium mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        id="date_of_birth"
                        name="date_of_birth"
                        value={formData.date_of_birth || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>

                    {/* Editable Gender Field */}
                    <div>
                      <label htmlFor="gender" className="block text-gray-700 font-medium mb-1">
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Save and Cancel Buttons */}
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}
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
              
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Shipping Address</h2>
                {!isAddAddress &&
                <FaPlusCircle className="w-6 h-6 hover:fill-green-500 cursor-pointer transition" title='Add Address' onClick={()=> setIsAddAddress(true)} />
                }
                </div>
              {isAddAddress && 
                <div className='mb-4'>
                  {/*Edit Form*/}
                  <form onSubmit={handleAddressSubmit} className="space-y-2">
                    <div className='w-full'>
                      <input
                        type="text"
                        name="title"
                        value={addressFormData.title || ''}
                        onChange={handleInputChange}
                        //onBlur={handleBlur}
                        placeholder='Home or Office'
                        className={`border  border-gray-300 p-2 rounded-lg w-full`}
                      />
                    </div>

                    <div className={`grid grid-cols-1 ${getLocationType()} gap-3 mb-3`}>
                      <div>
                      <select
                          name="shipping_type"
                          value={addressFormData.shipping_type || ''}
                          onChange={handleLocationType}
                          onBlur={handleBlur}
                          required
                          className="border border-gray-300 p-2 rounded-lg w-full"
                      >
                          <option value="">Select Shipping Area</option>
                          <option value="inside_dhaka">In Dhaka City</option>
                          <option value="outside_dhaka">Out of Dhaka City</option>
                      </select>
                      {touched.shipping_type && errors.shipping_type && <p className="text-red-500 text-xs mt-1">{errors.shipping_type}</p>}
                      </div>
                      {addressFormData.shipping_type === 'inside_dhaka' && (
                          <div className="grid grid-cols-1 gap-3">
                          <div className="w-full">
                              <select
                              name="shipping_area"
                              value={addressFormData.area || ''}
                              onChange={handleDhakaArea}
                              onBlur={handleBlur}
                              required
                              className={`border ${touched.area && errors.area ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                              >
                              <option value="">Select Area in</option>
                              {dhakaCityData.map((area) => (
                                  <option key={area.id} value={area.name}>{area.name}</option>
                              ))}
                              </select>
                              {touched.area && errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                          </div>
                          </div>
                      )}
                        {addressFormData.shipping_type === 'outside_dhaka' && (
                          <>
                          <div>
                              <select
                              name="division"
                              value={addressFormData.division || ''}
                              onChange={handleDivisionChange}
                              onBlur={handleBlur}
                              required
                              className={`border ${touched.division && errors.division ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                              >
                              <option value="">Select Division</option>
                              {divisionsData.map((division) => (
                                  <option key={division.id} value={division.name}>{division.name}</option>
                              ))}
                              </select>
                              {touched.division && errors.division && <p className="text-red-500 text-xs mt-1">{errors.division}</p>}
                          </div>
          
                          <div>
                              <select
                              name="district"
                              value={addressFormData.district || ''}
                              onChange={handleDistrictChange}
                              onBlur={handleBlur}
                              required
                              className={`border ${touched.district && errors.district ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                              disabled={!addressFormData.division}
                              >
                              <option value="">Select District</option>
                              {districts.map((district) => (
                                  <option key={district.id} value={district.name}>{district.name}</option>
                              ))}
                              </select>
                              {touched.district && errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                          </div>
          
                          <div>
                              <select
                              name="thana"
                              value={addressFormData.thana || ''}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              required
                              className={`border ${touched.thana && errors.thana ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                              disabled={!addressFormData.district}
                              >
                              <option value="">Select Upazila/Thana</option>
                              {upazillas.map((station) => (
                                  <option key={station.id} value={station.name}>{station.name}</option>
                              ))}
                              </select>
                              {touched.thana && errors.thana && <p className="text-red-500 text-xs mt-1">{errors.thana}</p>}
                          </div>
                          </>
                      )}
                    </div>

                    <div className="w-full">
                      <input
                        type="text"
                        name="address"
                        placeholder="Delivery Address"
                        value={addressFormData.address}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        required
                        className={`border ${touched.address && errors.address ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                      />
                      {touched.address && errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={()=> setIsAddAddress(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              }
              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {addresses.map((address) => (
                    <AddressItem key={address.id} address={address} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center bg-gray-100 p-6 rounded-md mb-4">
                  <p className="text-gray-600 mb-4">No shipping addresses found. Please add one.</p>
                </div>
              )}

              
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



