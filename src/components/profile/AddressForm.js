import React, { useId, useMemo, useState } from 'react';
import { Field, controlClass, describedBy } from '../common';
import { dhakaCityData, divisionsData } from '../../data/location';
import { districtsOf, upazilasOf } from '../../utils/location';
import { validateField } from '../../utils/checkoutValidation';
import { primary, secondary } from './styles';

// The boxes in the order they are on the page: the first one with a problem is where the customer is taken.
const FIELDS = ['shipping_type', 'area', 'division', 'district', 'thana', 'address'];
// The checkout form calls two of them differently; its sentences are used here so a box never says two things.
const CHECKOUT_NAME = { area: 'shipping_area', thana: 'upazila' };
// Choosing a box again empties the ones that hang on it.
const CLEARS = {
  shipping_type: { area: '', division: '', district: '', thana: '' },
  division: { district: '', thana: '' },
  district: { thana: '' },
};
const EMPTY = { title: '', shipping_type: '', area: '', division: '', district: '', thana: '', address: '' };
const ADDRESS_MAX = 500; // the backend's limit

const listed = (list, name) => list.some((item) => item.name === name);

// What the form starts with: nothing, or the saved address. A place the shop's own lists do not know (a saved name they do not
// have) is not kept: its box says "Choose ..." and the form asks again, rather than sending a value the customer cannot see.
const startForm = (address) => {
  const form = { ...EMPTY };
  if (!address) return form;
  Object.keys(EMPTY).forEach((name) => { form[name] = address[name] || ''; });
  if (form.shipping_type === 'inside_dhaka') {
    form.division = form.district = form.thana = '';
    if (!listed(dhakaCityData, form.area)) form.area = '';
  } else if (form.shipping_type === 'outside_dhaka') {
    form.area = '';
    if (!listed(divisionsData, form.division)) form.division = form.district = form.thana = '';
    else if (!listed(districtsOf(form.division), form.district)) form.district = form.thana = '';
    else if (!listed(upazilasOf(form.division, form.district), form.thana)) form.thana = '';
  } else {
    form.shipping_type = form.area = form.division = form.district = form.thana = '';
  }
  return form;
};

// One address, to add or to change: labels above the boxes, one column, 48 px, the delivery area first (the boxes under it depend
// on it). Every problem is said under its own box once Save was pressed, and the first is focused. `onSave(fields)` returns a
// promise: while it is on its way the button says so, and if the shop refuses (its refusal is `{errors: [sentences]}`) the
// sentences are shown here, above the buttons, and the form stays as it is. The caller closes the form when it resolves.
const AddressForm = ({ heading, address, submitLabel = 'Save address', onSave, onCancel }) => {
  const uid = useId();
  const id = (name) => `${uid}-${name}`;
  const [form, setForm] = useState(() => startForm(address));
  const [submitted, setSubmitted] = useState(false); // problems are shown once Save was pressed
  const [saving, setSaving] = useState(false);
  const [refusal, setRefusal] = useState([]);
  const [nothing, setNothing] = useState(false);

  const districts = useMemo(() => districtsOf(form.division), [form.division]);
  const upazilas = useMemo(() => upazilasOf(form.division, form.district), [form.division, form.district]);

  const problems = {};
  FIELDS.forEach((name) => {
    const message = validateField(CHECKOUT_NAME[name] || name, form[name], form);
    if (message) problems[name] = message;
  });
  if (!problems.address && form.address.trim().length > ADDRESS_MAX) problems.address = `Use ${ADDRESS_MAX} letters or fewer`;
  const problem = (name) => (submitted && problems[name]) || '';

  const change = (name) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, ...CLEARS[name], [name]: value }));
    setNothing(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setRefusal([]);
    const first = FIELDS.find((name) => problems[name]);
    if (first) {
      document.getElementById(id(first))?.focus();
      return;
    }
    const inside = form.shipping_type === 'inside_dhaka';
    const fields = {
      title: form.title.trim(),
      shipping_type: form.shipping_type,
      address: form.address.trim(),
      area: inside ? form.area : '',
      division: inside ? '' : form.division,
      district: inside ? '' : form.district,
      thana: inside ? '' : form.thana,
    };
    if (address && Object.keys(fields).every((name) => fields[name] === (address[name] || ''))) {
      setNothing(true);
      return;
    }
    setSaving(true);
    try {
      await onSave(fields);
    } catch (refused) {
      setRefusal(refused?.errors?.length ? refused.errors : ['Could not save the address. Please try again.']);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate aria-labelledby={id('heading')} className="space-y-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6">
      <h3 id={id('heading')} className="text-base font-semibold text-gray-800 sm:text-lg">{heading}</h3>

      <Field id={id('title')} label="Title" optional>
        <input
          id={id('title')} name="title" type="text" maxLength={100} autoComplete="off" enterKeyHint="next" placeholder="Home, Office, ..."
          value={form.title} onChange={change('title')}
          className={controlClass(false)}
        />
      </Field>

      <Field id={id('shipping_type')} label="Delivery area" error={problem('shipping_type')}>
        <select
          id={id('shipping_type')} name="shipping_type" value={form.shipping_type} onChange={change('shipping_type')}
          aria-invalid={Boolean(problem('shipping_type'))} aria-describedby={describedBy(id('shipping_type'), problem('shipping_type'))}
          className={controlClass(problem('shipping_type'))}
        >
          <option value="">Select delivery area</option>
          <option value="inside_dhaka">In Dhaka City</option>
          <option value="outside_dhaka">Out of Dhaka City</option>
        </select>
      </Field>

      {form.shipping_type === 'inside_dhaka' && (
        <Field id={id('area')} label="Area in Dhaka" error={problem('area')}>
          <select
            id={id('area')} name="area" value={form.area} onChange={change('area')}
            aria-invalid={Boolean(problem('area'))} aria-describedby={describedBy(id('area'), problem('area'))}
            className={controlClass(problem('area'))}
          >
            <option value="">Choose your area</option>
            {dhakaCityData.map((area) => (
              <option key={area.id} value={area.name}>{area.name}</option>
            ))}
          </select>
        </Field>
      )}

      {form.shipping_type === 'outside_dhaka' && (
        <>
          <Field id={id('division')} label="Division" error={problem('division')}>
            <select
              id={id('division')} name="division" value={form.division} onChange={change('division')}
              aria-invalid={Boolean(problem('division'))} aria-describedby={describedBy(id('division'), problem('division'))}
              className={controlClass(problem('division'))}
            >
              <option value="">Choose division</option>
              {divisionsData.map((division) => (
                <option key={division.id} value={division.name}>{division.name}</option>
              ))}
            </select>
          </Field>

          <Field id={id('district')} label="District" error={problem('district')}>
            <select
              id={id('district')} name="district" value={form.district} onChange={change('district')} disabled={!form.division}
              aria-invalid={Boolean(problem('district'))} aria-describedby={describedBy(id('district'), problem('district'))}
              className={controlClass(problem('district'))}
            >
              <option value="">Choose district</option>
              {districts.map((district) => (
                <option key={district.id} value={district.name}>{district.name}</option>
              ))}
            </select>
          </Field>

          <Field id={id('thana')} label="Upazila / Thana" error={problem('thana')}>
            <select
              id={id('thana')} name="thana" value={form.thana} onChange={change('thana')} disabled={!form.district}
              aria-invalid={Boolean(problem('thana'))} aria-describedby={describedBy(id('thana'), problem('thana'))}
              className={controlClass(problem('thana'))}
            >
              <option value="">Choose upazila / thana</option>
              {upazilas.map((station) => (
                <option key={station.id} value={station.name}>{station.name}</option>
              ))}
            </select>
          </Field>
        </>
      )}

      <Field id={id('address')} label="Full address" error={problem('address')}>
        <textarea
          id={id('address')} name="address" rows={3} autoComplete="street-address" placeholder="House, road, area"
          value={form.address} onChange={change('address')}
          aria-invalid={Boolean(problem('address'))} aria-describedby={describedBy(id('address'), problem('address'))}
          className={controlClass(problem('address'), true)}
        />
      </Field>

      {refusal.length > 0 && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{refusal.join(' ')}</p>
      )}
      {nothing && <p role="status" className="text-center text-sm text-gray-600">Nothing has changed yet.</p>}

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <button type="submit" disabled={saving} className={primary}>{saving ? 'Saving…' : submitLabel}</button>
        <button type="button" onClick={onCancel} disabled={saving} className={secondary}>Cancel</button>
      </div>
    </form>
  );
};

export default AddressForm;
