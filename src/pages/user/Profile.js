import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserEdit, FaMapMarkerAlt, FaHeart, FaChevronRight, FaBoxOpen } from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {handleGetProfile} from '../../redux/slice/profileSlice';
import {clearSectionError} from '../../redux/slice/globalErrorSlice';
import {SectionError} from '../../components/common';
import {AddressesTab, PersonalInfo, ProfileHeader} from '../../components/profile';
import { WishList } from '../user';
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
  const {isLoading, profile, error} = useSelector((state)=> state.profile);

  useEffect(()=>{
    isAuthenticated && dispatch(handleGetProfile());
  }, [dispatch, isAuthenticated]);

  const retryProfile = () => {
    dispatch(clearSectionError('get-profile'));
    dispatch(handleGetProfile());
  };

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
            onClick={() => setSelectedTab(tab.id)}
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

        {selectedTab === 'address' && <AddressesTab />}

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
