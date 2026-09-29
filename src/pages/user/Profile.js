import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserEdit, FaMapMarkerAlt, FaPlusCircle, FaHeart, FaChevronRight, FaBoxOpen } from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {handleAddressCreate, handleGetAddress, handleGetProfile, resetAddressForm, setDistricts, setErrors, setIsAddAddress, setUpazilas, updateAddressFormData, updateTouched} from '../../redux/slice/profileSlice';
import {clearSectionError} from '../../redux/slice/globalErrorSlice';
import {Loader, SectionError} from '../../components/common';
import {AddressItem, PersonalInfo, ProfileHeader} from '../../components/profile';
import { WishList } from '../user';
import {dhakaCityData, districtsData, divisionsData, upazilasData} from '../../data/location';
import {ProfileSkeleton} from '../../components/common/skeleton';

const TABS = [
  { label: 'Profile', icon: <FaUserEdit aria-hidden="true" />, id: 'overview' },
  { label: 'Addresses', icon: <FaMapMarkerAlt aria-hidden="true" />, id: 'address' },
  { label: 'Wishlist', icon: <FaHeart aria-hidden="true" />, id: 'wishlist' },
];

// The account page, phone first: who they are (picture, name, phone) at the top, a way to their orders, three tabs with their
// names always written out (the icons alone said nothing), and the tab. It sits straight on the page (the old one was a grey
// gradient page > white card > grey card > white card, which left a 360 px phone about 250 px for the form).
const Profile = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const dispatch = useDispatch();
  const {isAuthenticated} = useSelector((state)=>state.auth);
  const {isLoading, profile, error, adrressLoading,addresses, addressError, isAddAddress, addressFormData, touched, errors, districts,upazilas} = useSelector((state)=> state.profile);

  useEffect(()=>{
    isAuthenticated && dispatch(handleGetProfile());
  }, [dispatch, isAuthenticated]);

  const handleTabChange = (tab)=>{
    setSelectedTab(tab.id);
    if (tab.id === 'address') {
      dispatch(handleGetAddress());
    }
  }

  const retryProfile = () => {
    dispatch(clearSectionError('get-profile'));
    dispatch(handleGetProfile());
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

  // (a refresh shows what is already there instead of a skeleton over it)
  if (isLoading && !profile) return <div className="container mx-auto max-w-3xl px-3 py-4 sm:px-4 sm:py-8"><ProfileSkeleton /></div>;
  if (error && !profile) return <SectionError message={error} onRetry={retryProfile} />;

  return (
    <div className="container mx-auto max-w-3xl space-y-3 px-3 py-4 sm:space-y-4 sm:px-4 sm:py-8">
      <ProfileHeader profile={profile} />

      <Link to="/orders" className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-lg text-indigo-600"><FaBoxOpen /></span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-gray-900">My Orders</span>
          <span className="block truncate text-xs text-gray-500">Track, cancel or look back at what you ordered</span>
        </span>
        <FaChevronRight className="shrink-0 text-gray-400" aria-hidden="true" />
      </Link>

      <div role="tablist" aria-label="Account" className="grid grid-cols-3 gap-1 rounded-2xl bg-gray-100 p-1 text-gray-700">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selectedTab === tab.id}
            aria-controls="profile-panel"
            onClick={() => handleTabChange(tab)}
            className={`flex h-12 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors sm:text-base ${
              selectedTab === tab.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white shadow' : 'hover:bg-white/70'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="profile-panel" aria-labelledby={`tab-${selectedTab}`}>
        {selectedTab === 'overview' && <PersonalInfo profile={profile} />}

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
                <SectionError message={addressError} />
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
                                {dhakaCityData?.map((area) => (
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
                                {divisionsData?.map((division) => (
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
                                {districts?.map((district) => (
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
                                {upazilas?.map((station) => (
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
                    {addresses?.map((address) => (
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
            <WishList />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
