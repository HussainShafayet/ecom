import React, { useCallback, useEffect, useState } from 'react';
import { FaUserEdit, FaBoxOpen, FaMapMarkerAlt, FaCreditCard, FaLock, FaPlus, FaHeart, FaBell, FaHistory, FaCamera, FaPlusCircle, FaSpinner } from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {getUser} from '../../redux/slice/authSlice';
import {useNavigate} from 'react-router-dom';
import {handleAddressCreate, handleGetAddress, handleGetProfile, handleProfileUpdate, handleSendOtp, handleSubmitOtp, resetAddressForm, setDistricts, setErrors, setIsAddAddress, setUpazilas, updateAddressFormData, updateTouched} from '../../redux/slice/profileSlice';
import {ErrorDisplay, Loader, SuccessMessage} from '../../components/common';
import {AddressItem} from '../../components/profile';
import { WishList } from '../user';
import {dhakaCityData, districtsData, divisionsData, upazilasData} from '../../data/location';
import {ProfileSkeleton} from '../../components/common/skeleton';
import {debounce, set} from 'lodash';

const Profile = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const dispatch = useDispatch();
  const {isAuthenticated,user} = useSelector((state)=>state.auth);
  const {isLoading, profile, error, adrressLoading,addresses, addressError, isAddAddress, addressFormData, touched, errors, districts,upazilas, updateLoading, updateError, isSendOtpLoading,
    sendOtpMessage,
    sendOtpToken,
    isSendOtpError} = useSelector((state)=> state.profile);

  const navigate = useNavigate();
  

  const [isEditing, setIsEditing] = useState(false); // State to toggle edit mode
  const [formData, setFormData] = useState({}); // State to store form data
  const [image, setImage] = useState(profile?.profile_picture || "");
  const [numberVerify, setNumberVerify] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerify, setIsVerified] = useState(false);
  const [prevNumber, setPrevNumber] = useState('');

 
  
  useEffect(()=>{
    if (!isAuthenticated) {
      //navigate('/signin');
    }
    isAuthenticated && dispatch(handleGetProfile());
  }, [dispatch, isAuthenticated, navigate]);

  useEffect(()=>{
    setImage(profile?.profile_picture);
  }, [profile?.profile_picture]);

  // Debounced API call
  const debouncedAfterFileInput = useCallback(
    debounce((file) => {
      const formData = new FormData();
      formData.append("profile_picture", file);
      dispatch(handleProfileUpdate(formData));
    }, 1000),
    [dispatch] // Add dispatch as a dependency
  );

  const handleTabChange = (tab)=>{
    setSelectedTab(tab.id);
    if (tab.id === 'address') {
      dispatch(handleGetAddress());
    }
    
  }

  const handleShowInfoEdit = ()=>{
    setIsEditing(true);
    setFormData({...profile});
    setPrevNumber(profile?.phone_number);
  }


   // Handle form input changes
   const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submissiontrue
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      // Create a new FormData instance
      const formDataObj = new FormData();
    
      // Append only changed fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== profile[key] && value !== '') { // Only add if changed and not empty
          formDataObj.append(key, value);
        }
      });
    
      // Only dispatch if there are changes
      if (formDataObj.entries().next().done) {
        console.log('No changes detected.');
        return;
      }else if(prevNumber !== formData.phone_number && !isVerify){
        alert('Verify your phone number.');
        return
      }
      
      const resonse = await dispatch(handleProfileUpdate(formDataObj)).unwrap();
      resonse && setIsEditing(false);
    } catch (error) {
      console.log('handleSubmit errror: ', error);
      
    }
  };


  //for address
   // Handle input changes
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      dispatch(updateAddressFormData({ [name]: value }));
    };

    const handleBlur = (e) => {
      const { name } = e.target;
      dispatch(updateTouched({ [name]: true }));
      
      // Validate field on blur to show error if empty
      if (!addressFormData[name]?.trim()) {
        dispatch(setErrors({ ...errors, [name]: `${name} is required` }));
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
          dispatch(updateAddressFormData({ shipping_type:locationType, area: '', division: '', district: '', thana: '', address: '' }));
          
           // Validate field on change and clear error if valid
           if (locationType?.trim()) {
            dispatch(setErrors({ ...errors, ['shipping_type']: '' }));
          }
        }
        const handleDhakaArea = (e) => {
          const area = e.target.value;
          dispatch(updateAddressFormData({ area, division: '', district: '', thana: '',}));
          
          // Validate field on change and clear error if valid
          if (area.trim()) {
            dispatch(setErrors({ ...errors, ['area']: '' }));
          }
      }
      const handleDivisionChange = (e) => {
          const division = e.target.value;
          const divisionItem = divisionsData.find((item)=> item.name === division);
          if (divisionItem) {
            dispatch(updateAddressFormData({ division, district: '', thana: '' }));

            const divisionDist = districtsData.filter((item)=> item.division_id === divisionItem.id);
            
            dispatch(setDistricts(divisionDist|| []));
            dispatch(setUpazilas([]));
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
            dispatch(updateAddressFormData({ district, thana: '' }));
      
            const upzillaDist = upazilasData.filter((item)=> item.district_id === districtItem.id);
            
            dispatch(setUpazilas(upzillaDist|| []));
          }
           // Validate field on change and clear error if valid
           if (district.trim()) {
            dispatch(setErrors({ ...errors, ['district']: '' }));
          }
        };

        
  const handleAddressSubmit = (e) =>{
    e.preventDefault();
    console.log(addressFormData, 'address');
    dispatch(handleAddressCreate(addressFormData));
    dispatch(setIsAddAddress(false));
  }


  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Preview image before upload
      };
      reader.readAsDataURL(file);
      debouncedAfterFileInput(file);
    }
  };

  const handleVerifyClick = async ()=> {
    try {
      const phoneNumber = formData.phone_number;
      if (!phoneNumber || phoneNumber.replace('+880', '').length < 10) {
        alert('Please enter a valid phone number.');
        return;
      }

      const response = await dispatch(handleSendOtp({phone_number: phoneNumber})).unwrap();
      response.success && setNumberVerify(true);
   } catch (error) {
      console.log('handle send otp error: ', error);
      
    }
  }

  const handleVerifyNumber = async  (e) => {
    e.preventDefault();
    try {
      const response = await dispatch(handleSubmitOtp({token: sendOtpToken, otp})).unwrap();
      if(response.success)  {
        setNumberVerify(false)
        setIsVerified(true);
        setOtp('');
      };
      
    } catch (error) {
      console.log('handle verify otp error', error);
      
    }

    
  }



  //if (isLoading) {
  //  return <div className='container h-screen flex justify-center'><Loader message='Loading Profile' /></div>
  //}

  //if (error) {
  //  return <div className="text-center text-red-500">{error}</div>;
  //}

  return (
    <>
    {isLoading ? <ProfileSkeleton /> :
      error ? (
      <div className="text-center text-red-500 font-semibold py-4">
        {error} - Please try again later.
      </div>
    ) :
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
              { label: 'Shipping Addresses', icon: <FaMapMarkerAlt />, id: 'address' },
              { label: 'Wishlist', icon: <FaHeart />, id: 'wishlist' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab)}
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
                {/* Loader Overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                      <FaSpinner className="animate-spin text-white text-3xl" />
                    </div>
                  )}
                  <img
                    src={image || "https://img.freepik.com/premium-photo/stylish-man-flat-vector-profile-picture-ai-generated_606187-310.jpg"}
                    alt="Profile"
                    className={`w-full h-full object-cover ${isLoading ? "opacity-50" : ""}`}
                  />
                  
                  {/* Hidden file input */}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="fileInput"
                    onChange={handleFileChange}
                  />
                  
                  {/* Camera Button */}
                  <label htmlFor="fileInput" className="absolute bottom-0 right-12 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors cursor-pointer">
                    <FaCamera />
                  </label>
                  )}
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
                      {profile?.gender && <p className="mb-2"><strong>Gender:</strong> {profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : ''}</p>}

                      <button
                        onClick={handleShowInfoEdit}
                        className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Edit Information
                      </button>
                    </>
                  ) : (
                    <>
                    <ErrorDisplay errors={updateError} />
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                      <div>
                        <label htmlFor="phone" className="block text-gray-700 font-medium mb-1">
                          Phone Number
                        </label>
                        <div className="flex items-center border border-gray-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-blue-400 bg-white bg-opacity-70">
                          {/* Country Code */}
                          <select
                            id="country-code"
                            className="bg-gray-100 text-gray-700 font-medium px-2 sm:px-3 py-2 border-r border-gray-300 focus:outline-none rounded-l-md"
                            value="+880"
                            disabled
                          >
                            <option value="+880">+880</option>
                          </select>

                          {/* Phone Number Input */}
                          <input
                            type="tel"
                            id="phone"
                            name="phone_number"
                            placeholder="Phone Number"
                            maxLength={10}
                            value={formData.phone_number.replace('+880', '')} // Remove country code for display
                            onChange={(e) => {
                              const phoneNumber = e.target.value;
                              const fullPhoneNumber = `+880${phoneNumber}`;
                              handleChange({ target: { name: 'phone_number', value: fullPhoneNumber } });
                              setIsVerified(false);
                            }}
                            className="w-full px-3 py-2 border-none focus:outline-none"
                            required
                          />

                          {/* Verify Button */}
                          {prevNumber !== formData.phone_number && 
                            <button
                              type="button"
                              onClick={handleVerifyClick}
                              disabled={isSendOtpLoading}
                              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 disabled:opacity-50"
                              disabled={isVerify}
                            >
                              {isSendOtpLoading ? 'Sending...' : 
                              
                              isVerify? 'Verified': 
                              'Verify'}
                            </button>
                          }
                        </div>
                      </div>


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
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
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
                        <button type="submit" className={`px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors transform duration-200 cursor-pointer ${
                            updateLoading ? 'cursor-wait' : 'hover:scale-105'
                          }`}
                          disabled={updateLoading}
                        
                        >
                        {updateLoading ? (
                            <Loader message="Progreccing" />
                          ) : (
                            "Save Changes"
                          )}
                      </button>
                      </div>
                    </form>

                    {/*number verify*/}
                    {numberVerify && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10">
                            <div className="bg-white p-3 rounded-lg shadow-lg">
                                <h3 className="text-lg font-semibold">Verify Number</h3>
                                {/* Success Message */}
                                <span className='text-green-500 text-sm'>{sendOtpMessage}</span>
                                 { Array.isArray(isSendOtpError) ? 
                                    <ErrorDisplay errors={isSendOtpError} /> :
                                  <>
                                  {isSendOtpError && <div className="text-center text-red-500 font-semibold py-4">
                                    {isSendOtpError}.
                                  </div>}
                                  </>
                                  }
                                <form onSubmit={handleVerifyNumber}>
                                  <div>
                                    <label htmlFor="otp" className="block text-gray-700 font-medium mb-1">
                                      OTP
                                    </label>
                                    <input
                                      type="number"
                                      id="otp"
                                      name="otp"
                                      value={otp}
                                      onChange={(e)=> setOtp(e.target.value)}
                                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    />
                                  </div>
                               
                                <div className="mt-4 flex justify-end space-x-2">
                                    <button
                                        onClick={() => {
                                          setNumberVerify(false)
                                          setOtp(''); 
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className={`px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors transform duration-200 cursor-pointer ${
                                          isSendOtpLoading ? 'cursor-wait' : 'hover:scale-105'
                                        }`}
                                        disabled={isSendOtpLoading}
                                      
                                      >
                                      {isSendOtpLoading ? (
                                          <Loader message="Progreccing" />
                                        ) : (
                                          "Submit"
                                        )}
                                    </button>
                                </div>
                                </form>
                            </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

          

            {selectedTab === 'address' && (
            
              <div>
              {adrressLoading ? 
                <div className="mt-6">
                  <div className="h-8 w-48 bg-gray-300 rounded mb-4"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, index) => (
                      <div key={index} className="h-32 bg-gray-300 rounded"></div>
                    ))}
                  </div>
                </div>
              
               :
                addressError ? (
                <div className="text-center text-red-500 font-semibold py-4">
                  {addressError} - Please try again later.
                </div>
              ) :
                <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Shipping Address</h2>
                  {!isAddAddress &&
                  <FaPlusCircle className="w-6 h-6 hover:fill-green-500 cursor-pointer transition" title='Add Address' onClick={()=> dispatch(setIsAddAddress(true))} />
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
                                name="area"
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
                                {upazilas.map((station) => (
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
                          onClick={()=>{
                            dispatch(setIsAddAddress(false))
                            dispatch(resetAddressForm());
                          } 
                          }
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button type="submit" className={`px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors transform duration-200 cursor-pointer ${
                              adrressLoading ? 'cursor-wait' : 'hover:scale-105'
                            }`}
                            disabled={adrressLoading}
                          
                          >
                          {adrressLoading ? (
                              <Loader message="Progreccing" />
                            ) : (
                              "Save"
                            )}
                        </button>
                      </div>
                    </form>
                  </div>
                }
                {addresses?.length > 0 ? (
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
                </>
                }
              </div>

            )}

            {selectedTab === 'wishlist' && (
              <div>
                {/*<h2 className="text-xl font-semibold mb-4">My Wishlist</h2>
                <p className="text-gray-500">You haven’t added any items to your wishlist yet.</p>*/}
                <WishList />
              </div>
            )}
          </div>
        </div>
      </div>
    }
    </>
  );
};

export default Profile;



