import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserEdit, FaMapMarkerAlt, FaHeart, FaChevronRight, FaBoxOpen } from 'react-icons/fa';
import {useDispatch, useSelector} from 'react-redux';
import {handleGetProfile} from '../../redux/slice/profileSlice';
import {fetchOrdersTotal} from '../../redux/slice/orderSlice';
import {fetchtoWishlist} from '../../redux/slice/wishlistSlice';
import {clearSectionError} from '../../redux/slice/globalErrorSlice';
import {SectionError} from '../../components/common';
import {AddressesTab, PersonalInfo, ProfileHeader} from '../../components/profile';
import { WishList } from '../user';
import {ProfileSkeleton} from '../../components/common/skeleton';
import usePageTitle from '../../hooks/usePageTitle';

const TABS = [
  { label: 'Profile', icon: <FaUserEdit aria-hidden="true" />, id: 'overview' },
  { label: 'Addresses', icon: <FaMapMarkerAlt aria-hidden="true" />, id: 'address' },
  { label: 'Wishlist', icon: <FaHeart aria-hidden="true" />, id: 'wishlist' },
];

const countOf = (number, word) => `${number} ${word}${number === 1 ? '' : 's'}`;

// The account page, phone first: who they are (picture, name, phone) at the top, a way to their orders, three tabs with their
// names always written out (the icons alone said nothing), and the tab. It sits straight on the page (the old one was a grey
// gradient page > white card > grey card > white card, which left a 360 px phone about 250 px for the form).
const Profile = () => {
  usePageTitle('My account');
  const [selectedTab, setSelectedTab] = useState('overview');
  const dispatch = useDispatch();
  const {isAuthenticated} = useSelector((state)=>state.auth);
  const {isLoading, profile, error} = useSelector((state)=> state.profile);
  const ordersTotal = useSelector((state) => state.order?.ordersTotal ?? null);
  const wishlist = useSelector((state) => state.wishList);
  const [wishlistRead, setWishlistRead] = useState(false);

  useEffect(()=>{
    isAuthenticated && dispatch(handleGetProfile());
  }, [dispatch, isAuthenticated]);

  // The two numbers beside "My Orders" and "Wishlist". Each is drawn only once the shop has answered (a guess from what this phone
  // remembers could be wrong) and a failed read draws no number instead of a wrong one or an error: the page is complete without them.
  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchOrdersTotal());
    dispatch(fetchtoWishlist()).unwrap().then(() => setWishlistRead(true)).catch(() => {});
  }, [dispatch, isAuthenticated]);
  const wishlistCount = wishlistRead && !wishlist?.error && Array.isArray(wishlist?.items) ? wishlist.items.length : 0;

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
          <span className="flex items-center gap-2 font-semibold text-gray-900">
            My Orders
            {ordersTotal > 0 && (
              <span className="rounded-full bg-indigo-50 px-2 text-xs font-semibold leading-5 text-indigo-700">
                {ordersTotal}<span className="sr-only"> {ordersTotal === 1 ? 'order' : 'orders'}</span>
              </span>
            )}
          </span>
          <span className="block truncate text-xs text-gray-500">Track, cancel or look back at what you ordered</span>
        </span>
        <FaChevronRight className="shrink-0 text-gray-400" aria-hidden="true" />
      </Link>

      <div role="tablist" aria-label="Account" className="grid grid-cols-3 gap-1 rounded-2xl bg-gray-100 p-1 text-gray-700">
        {TABS.map((tab) => {
          const count = tab.id === 'wishlist' ? wishlistCount : 0;
          const selected = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls="profile-panel"
              onClick={() => setSelectedTab(tab.id)}
              className={`flex h-12 items-center justify-center gap-1.5 rounded-xl text-sm font-medium transition-colors sm:gap-2 sm:text-base ${
                selected ? 'bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-white shadow' : 'hover:bg-white/70'
              }`}
            >
              {tab.icon}
              {tab.label}
              {count > 0 && (
                <span className={`min-w-[1.25rem] rounded-full px-1.5 text-xs font-semibold leading-5 ${selected ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                  <span aria-hidden="true">{count > 99 ? '99+' : count}</span>
                  <span className="sr-only">, {countOf(count, 'item')}</span>
                </span>
              )}
            </button>
          );
        })}
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
