import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCamera, FaSpinner } from 'react-icons/fa';
import { handleProfileUpdate } from '../../redux/slice/profileSlice';

// What the backend accepts as a picture (docs/API_CONTRACT.md section 3): the real format is checked there, this only saves a
// slow upload that is bound to be refused.
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_MB = 5;

// The top of the account page, in the same look as the sign-in pages so it is recognisably THIS shop's: a band in the site's
// blue-to-purple with the shop's logo and name, the customer's picture on its lower edge (their initial on the same gradient until
// they add one: no picture from another website), then their name and phone. The whole picture is the button that changes it
// (96 px to hit, not a small camera icon), a new one shows at once and goes to the shop, and if the shop refuses it the old one
// comes back and says why. Everything is drawn with CSS.
const ProfileHeader = ({ profile }) => {
  const dispatch = useDispatch();
  const site = useSelector((state) => state.site?.site);
  const { updateLoading } = useSelector((state) => state.profile);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [problem, setProblem] = useState('');

  useEffect(() => {
    setPreview(null); // the saved picture (a new address from the shop) takes over from the preview
  }, [profile?.profile_picture]);

  const change = (event) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // choosing the same file again must fire again
    if (!file) return;
    if (!TYPES.includes(file.type)) {
      setProblem('Choose a JPEG, PNG or WebP picture.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setProblem(`That picture is too big. The most is ${MAX_MB} MB.`);
      return;
    }
    setProblem('');
    let refused = false; // a picture the shop turned down must not be shown after all if it finishes reading late
    const reader = new FileReader();
    reader.onloadend = () => { if (!refused) setPreview(reader.result); };
    reader.readAsDataURL(file);

    const body = new FormData();
    body.append('profile_picture', file);
    setUploading(true);
    dispatch(handleProfileUpdate(body)).unwrap()
      .catch((refusal) => {
        refused = true;
        setPreview(null);
        setProblem((refusal?.errors && refusal.errors[0]) || refusal?.error || 'The picture could not be saved. Please try again.');
      })
      .finally(() => setUploading(false));
  };

  const picture = preview || profile?.profile_picture;
  const initial = (profile?.name || '?').trim().charAt(0).toUpperCase();
  const busy = uploading && updateLoading;
  const shop = site?.name || '';

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md">
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-5 pt-4 text-white sm:h-36">
        {/* decoration only */}
        <span aria-hidden="true" className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
        <span aria-hidden="true" className="absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-white/10" />
        <span aria-hidden="true" className="absolute bottom-4 right-6 h-14 w-14 opacity-30 [background-image:radial-gradient(currentColor_1.5px,transparent_1.5px)] [background-size:10px_10px]" />
        <div className="relative flex items-center gap-2">
          <img
            src={site?.logo || '/static image/gocart-logo.svg'}
            alt={shop ? `${shop} logo` : 'Shop logo'}
            className="h-8 w-8 shrink-0 rounded-full bg-white object-contain p-1 shadow"
          />
          <p className="truncate text-sm font-semibold">{shop || 'My account'}</p>
        </div>
      </div>

      <div className="px-4 pb-5 text-center sm:px-6">
        <label
          htmlFor="profile-picture"
          className="relative mx-auto -mt-12 block h-24 w-24 cursor-pointer rounded-full shadow-lg ring-4 ring-white focus-within:ring-blue-300 sm:-mt-14 sm:h-28 sm:w-28"
        >
          <span className="absolute inset-0 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
            {picture ? (
              <img src={picture} alt="" className={`h-full w-full object-cover ${busy ? 'opacity-50' : ''}`} />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-4xl font-bold text-white sm:text-5xl" aria-hidden="true">{initial}</span>
            )}
            {busy && <span className="absolute inset-0 flex items-center justify-center bg-black/20"><FaSpinner className="animate-spin text-2xl text-white" aria-hidden="true" /></span>}
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white text-sm text-indigo-600 shadow" aria-hidden="true"><FaCamera /></span>
          <span className="sr-only">Change profile picture</span>
          <input id="profile-picture" type="file" accept="image/jpeg,image/png,image/webp" onChange={change} className="sr-only" />
        </label>

        <h1 className="mt-2 truncate text-xl font-bold text-gray-900 sm:text-2xl">{profile?.name || 'My Profile'}</h1>
        {profile?.phone_number && <p className="text-sm text-gray-600">{profile.phone_number}</p>}
        <label htmlFor="profile-picture" className="inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold text-indigo-700 hover:underline">
          {picture ? 'Change photo' : 'Add a photo'}
        </label>
        {problem && <p role="alert" className="text-sm text-red-600">{problem}</p>}
      </div>
    </section>
  );
};

export default ProfileHeader;
