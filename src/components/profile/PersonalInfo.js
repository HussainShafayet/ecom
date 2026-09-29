import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaAt, FaBirthdayCake, FaCheckCircle, FaEnvelope, FaPhoneAlt, FaUser, FaVenusMars } from 'react-icons/fa';
import { handleProfileUpdate, handleSendOtp, setInfoEditing, statusUpdateVerified } from '../../redux/slice/profileSlice';
import { pushToast } from '../../redux/slice/toastSlice';
import { Field, PhoneInput, controlClass, describedBy } from '../common';
import VerifySheet from './VerifySheet';
import { PHONE_PREFIX, normalizePhone, validatePhone } from '../../utils/phone';

const GENDERS = { male: 'Male', female: 'Female', other: 'Other' };

// "2000-05-01" as "1 May 2000" (built from its parts: `new Date("2000-05-01")` is UTC midnight and may be the day before)
const birthday = (iso) => {
  const [year, month, day] = String(iso).split('-').map(Number);
  return year && month && day ? new Date(year, month - 1, day).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : iso;
};

const today = () => new Date().toISOString().slice(0, 10);

const primary = 'flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 px-6 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70';
const secondary = 'flex h-12 w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-6 font-semibold text-gray-800 hover:bg-gray-50';

// One detail: a small round icon and the label above, the value under it
const Row = ({ label, icon, children }) => (
  <div className="py-3">
    <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
      <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] text-indigo-600">{icon}</span>
      {label}
    </dt>
    <dd className="break-words pl-8 text-base text-gray-900">{children}</dd>
  </div>
);

// The customer's details: read as a list (label small above the value), Edit turns it into a form with 48 px controls and the
// buttons under it. A NEW phone number or e-mail must be verified with a code before it can be saved (the backend refuses it
// otherwise): "Send code" sits under the box that changed, the code is asked for in a sheet (VerifySheet). Everything the
// customer did wrong is said under its own box, nothing in a browser alert.
const PersonalInfo = ({ profile }) => {
  const dispatch = useDispatch();
  const { infoEditing, updateLoading, updateError, updateFieldErrors, verified, verifyPopup, verifyError, loading } = useSelector((state) => state.profile);
  const [form, setForm] = useState({});
  const [submitted, setSubmitted] = useState(false); // problems are shown once Save was pressed
  const [nothing, setNothing] = useState(false);
  const [edited, setEdited] = useState({}); // fields changed since the shop last refused the save: what it said about them is old

  const current = {
    phone: normalizePhone(profile?.phone_number),
    email: profile?.email || '',
  };
  const changed = {
    phone: infoEditing && form.phone !== current.phone,
    email: infoEditing && (form.email || '').trim() !== current.email,
  };
  // an e-mail that was cleared needs no code (it is removed), a new one does
  const needsCode = { phone: changed.phone, email: changed.email && Boolean((form.email || '').trim()) };

  const startEdit = () => {
    setForm({
      name: profile?.name || '',
      username: profile?.username || '',
      email: profile?.email || '',
      phone: current.phone,
      date_of_birth: profile?.date_of_birth || '',
      gender: profile?.gender || '',
    });
    setSubmitted(false);
    setNothing(false);
    setEdited({});
    dispatch(setInfoEditing(true));
  };

  const set = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setNothing(false);
    setEdited((prev) => ({ ...prev, [field]: true }));
    if (field === 'phone' || field === 'email') dispatch(statusUpdateVerified({ field })); // a different value needs its own code
  };
  const onInput = (field) => (event) => set(field)(event.target.value);

  const problems = {};
  if (infoEditing) {
    if (!form.name?.trim()) problems.name = 'Enter your name';
    else if (form.name.trim().length > 150) problems.name = 'Use 150 letters or fewer';
    const username = form.username?.trim();
    if (username && !/^[A-Za-z0-9_.-]{3,50}$/.test(username)) problems.username = 'Use 3 to 50 letters, numbers, dots, dashes or underscores';
    const email = form.email?.trim();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) problems.email = 'Enter a valid e-mail address, or leave it empty';
    else if (needsCode.email && !verified.email) problems.email = 'Verify this e-mail with a code first';
    const phoneProblem = validatePhone(form.phone) || (needsCode.phone && !verified.phone ? 'Verify this number with a code first' : '');
    if (phoneProblem) problems.phone = phoneProblem;
    if (form.date_of_birth && form.date_of_birth > today()) problems.date_of_birth = 'A birthday cannot be in the future';
  }
  const serverKey = { phone: 'phone_number' }; // the backend's name for the field
  const problem = (field) => (submitted && problems[field]) || (!edited[field] && updateFieldErrors?.[serverKey[field] || field]?.[0]) || '';
  const ORDER = ['name', 'username', 'email', 'phone', 'date_of_birth'];
  const IDS = { name: 'profile-name', username: 'profile-username', email: 'profile-email', phone: 'profile-phone', date_of_birth: 'profile-dob' };

  const save = (event) => {
    event.preventDefault();
    setSubmitted(true);
    setEdited({});
    const first = ORDER.find((field) => problems[field]);
    if (first) {
      document.getElementById(IDS[first])?.focus();
      return;
    }
    // only what changed: the backend takes a partial update, and a number or e-mail that did not change needs no code
    const payload = {};
    if (form.name.trim() !== (profile?.name || '')) payload.name = form.name.trim();
    if ((form.username || '').trim() !== (profile?.username || '')) payload.username = form.username.trim();
    if (changed.email) payload.email = form.email.trim();
    if (changed.phone) payload.phone_number = PHONE_PREFIX + form.phone;
    if ((form.date_of_birth || '') !== (profile?.date_of_birth || '')) payload.date_of_birth = form.date_of_birth || null;
    if ((form.gender || '') !== (profile?.gender || '')) payload.gender = form.gender;
    if (Object.keys(payload).length === 0) {
      setNothing(true);
      return;
    }
    dispatch(handleProfileUpdate(payload)).unwrap()
      .then(() => dispatch(pushToast('Profile updated', 'success', 3000)))
      .catch(() => {}); // the refusal is in the slice (updateError / updateFieldErrors) and drawn above Save
  };

  const sendCode = (field) => {
    const request = field === 'phone' ? { phone_number: PHONE_PREFIX + form.phone } : { email: form.email.trim() };
    dispatch(handleSendOtp({ formData: request, field }));
  };

  // "Send code" / "Verified" under the box whose value is new
  const verifyRow = (field, label) => {
    if (!needsCode[field]) return null;
    const valid = field === 'phone' ? !validatePhone(form.phone) : /^\S+@\S+\.\S+$/.test(form.email.trim());
    if (!valid) return null;
    return (
      <div className="mt-2">
        {verified[field] ? (
          <p className="flex min-h-11 items-center gap-2 text-sm font-semibold text-green-700"><FaCheckCircle aria-hidden="true" /> This {label} is verified</p>
        ) : (
          <>
            <p className="text-xs text-gray-500">A new {label} needs a code before it can be saved.</p>
            <button
              type="button"
              onClick={() => sendCode(field)}
              disabled={loading[field]}
              className="mt-1 h-11 rounded-lg border border-blue-600 px-5 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
            >
              {loading[field] ? 'Sending…' : 'Send code'}
            </button>
            {!verifyPopup[field] && Array.isArray(verifyError[field]) && verifyError[field].length > 0 && (
              <p role="alert" className="mt-1 text-sm text-red-600">{verifyError[field].join(' ')}</p>
            )}
          </>
        )}
      </div>
    );
  };

  const sheetField = verifyPopup.phone ? 'phone' : verifyPopup.email ? 'email' : null;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="mb-1 text-base font-semibold text-gray-800 sm:text-lg">Personal information</h2>

      {!infoEditing ? (
        <>
          <dl className="divide-y divide-gray-100">
            {profile?.name && <Row label="Name" icon={<FaUser />}>{profile.name}</Row>}
            {profile?.username && <Row label="User name" icon={<FaAt />}>{profile.username}</Row>}
            {profile?.email && <Row label="E-mail" icon={<FaEnvelope />}>{profile.email}</Row>}
            {profile?.phone_number && <Row label="Phone" icon={<FaPhoneAlt />}>{profile.phone_number}</Row>}
            {profile?.date_of_birth && <Row label="Date of birth" icon={<FaBirthdayCake />}>{birthday(profile.date_of_birth)}</Row>}
            {profile?.gender && <Row label="Gender" icon={<FaVenusMars />}>{GENDERS[profile.gender] || profile.gender}</Row>}
          </dl>
          <button type="button" onClick={startEdit} className={`${primary} mt-3`}>Edit information</button>
        </>
      ) : (
        <form onSubmit={save} noValidate className="mt-3 space-y-4">
          <Field id="profile-name" label="Name" error={problem('name')}>
            <input
              id="profile-name" name="name" type="text" autoComplete="name" enterKeyHint="next"
              value={form.name} onChange={onInput('name')}
              aria-invalid={Boolean(problem('name'))} aria-describedby={describedBy('profile-name', problem('name'))}
              className={controlClass(problem('name'))}
            />
          </Field>

          <Field id="profile-username" label="User name" optional error={problem('username')}>
            <input
              id="profile-username" name="username" type="text" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} enterKeyHint="next"
              value={form.username} onChange={onInput('username')}
              aria-invalid={Boolean(problem('username'))} aria-describedby={describedBy('profile-username', problem('username'))}
              className={controlClass(problem('username'))}
            />
          </Field>

          <div>
            <Field id="profile-email" label="E-mail" optional error={problem('email')}>
              <input
                id="profile-email" name="email" type="email" inputMode="email" autoComplete="email" enterKeyHint="next"
                value={form.email} onChange={onInput('email')}
                aria-invalid={Boolean(problem('email'))} aria-describedby={describedBy('profile-email', problem('email'))}
                className={controlClass(problem('email'))}
              />
            </Field>
            {verifyRow('email', 'e-mail')}
          </div>

          <div>
            <Field id="profile-phone" label="Phone number" error={problem('phone')}>
              <PhoneInput id="profile-phone" name="phone" value={form.phone} onChange={set('phone')} error={problem('phone')} />
            </Field>
            {verifyRow('phone', 'number')}
          </div>

          <Field id="profile-dob" label="Date of birth" optional error={problem('date_of_birth')}>
            <input
              id="profile-dob" name="date_of_birth" type="date" max={today()} autoComplete="bday"
              value={form.date_of_birth} onChange={onInput('date_of_birth')}
              aria-invalid={Boolean(problem('date_of_birth'))} aria-describedby={describedBy('profile-dob', problem('date_of_birth'))}
              className={controlClass(problem('date_of_birth'))}
            />
          </Field>

          <Field id="profile-gender" label="Gender" optional>
            <select id="profile-gender" name="gender" value={form.gender} onChange={onInput('gender')} className={controlClass(false)}>
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </Field>

          {updateError && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{Array.isArray(updateError) ? updateError.join(' ') : updateError}</p>
          )}
          {nothing && <p role="status" className="text-center text-sm text-gray-600">Nothing has changed yet.</p>}

          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <button type="submit" disabled={updateLoading} className={primary}>{updateLoading ? 'Saving…' : 'Save changes'}</button>
            <button type="button" onClick={() => dispatch(setInfoEditing(false))} className={secondary}>Cancel</button>
          </div>
        </form>
      )}

      {sheetField && (
        <VerifySheet
          field={sheetField}
          label={sheetField === 'phone' ? 'phone number' : 'e-mail'}
          request={sheetField === 'phone' ? { phone_number: PHONE_PREFIX + form.phone } : { email: (form.email || '').trim() }}
        />
      )}
    </section>
  );
};

export default PersonalInfo;
