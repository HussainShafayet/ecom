// The Addresses tab, phone first: cards (title, inside/outside Dhaka, the address in lines, labelled Edit / Delete), ONE form for
// adding and changing (labels above, every problem said under its own box and the first one focused), a form that closes only
// after the shop took the address and says what the shop said when it did not, a delete that asks in the card, a list that
// could not be read with Try again. Real slices, a mocked authenticated client.
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, within} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';

import profileReducer, {handleAddressCreate, handleAddressDelete, handleAddressUpdate, handleGetAddress} from '../redux/slice/profileSlice';
import authReducer, {logoutUser} from '../redux/slice/authSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import toastReducer from '../redux/slice/toastSlice';
import api from '../api/axiosSetup';
import {AddressesTab} from '../components/profile';

vi.setConfig({testTimeout: 15000});

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn()}}));

const HOME = {id: 1, title: 'Home', shipping_type: 'inside_dhaka', address: 'House 5, Road 3', area: 'Gulshan', division: '', district: '', thana: ''};
const VILLAGE = {id: 2, title: '', shipping_type: 'outside_dhaka', address: 'Near the bazaar', area: '', division: 'Barishal', district: 'Barguna', thana: 'Amtali'};
const refused = (errors, status = 400) => ({response: {status, headers: {}, data: {success: false, errors}}});
const never = () => new Promise(() => {});

const makeStore = (addresses = null) => configureStore({
  reducer: {profile: profileReducer, auth: authReducer, globalError: globalErrorReducer, toast: toastReducer},
  preloadedState: addresses ? {profile: {...profileReducer(undefined, {type: '@@init'}), addresses, addressesLoaded: true}} : undefined,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const renderTab = async (list = [HOME, VILLAGE], store = makeStore()) => {
  api.get.mockResolvedValue({data: {data: list}});
  const utils = render(<Provider store={store}><AddressesTab /></Provider>);
  await act(async () => {});
  return {store, ...utils};
};
const click = async (name) => { await act(async () => { fireEvent.click(screen.getByRole('button', {name})); }); };
const pick = (label, value) => fireEvent.change(screen.getByLabelText(label), {target: {value}});
const fill = async () => {
  pick('Delivery area', 'inside_dhaka');
  pick('Area in Dhaka', 'Banani');
  fireEvent.change(screen.getByLabelText('Full address'), {target: {value: '  Flat 4B, Road 11  '}});
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  vi.spyOn(window, 'confirm').mockImplementation(() => true);
});
afterEach(() => {
  expect(window.alert).not.toHaveBeenCalled();
  expect(window.confirm).not.toHaveBeenCalled(); // deleting asks in the card, not in a browser dialog
});

describe('The list', () => {
  it('reads the addresses when the tab opens, first as a skeleton, not as "no addresses"', async () => {
    api.get.mockReturnValue(never());
    const {container} = render(<Provider store={makeStore()}><AddressesTab /></Provider>);
    expect(container.querySelector('.animate-pulse')).toBeTruthy(); // from the very first frame
    await act(async () => {});
    expect(container.querySelector('.animate-pulse')).toBeTruthy(); // and while it is on its way
    expect(screen.queryByText('No saved addresses yet')).toBeNull();
    expect(api.get).toHaveBeenCalledWith('/accounts/addresses/', expect.anything());
  });

  it('draws a card per address: title, inside or outside Dhaka, the address in lines', async () => {
    await renderTab();
    expect(screen.getByRole('heading', {name: /Saved addresses/}).textContent).toContain('(2)');

    const home = screen.getByRole('heading', {name: 'Home'}).closest('article');
    expect(within(home).getByText('Inside Dhaka')).toBeTruthy();
    expect(within(home).getByText('House 5, Road 3')).toBeTruthy();
    expect(within(home).getByText('Gulshan, Dhaka')).toBeTruthy();

    const village = screen.getByRole('heading', {name: 'Address'}).closest('article'); // no title
    expect(within(village).getByText('Outside Dhaka')).toBeTruthy();
    expect(within(village).getByText('Amtali, Barguna, Barishal')).toBeTruthy();
  });

  it('gives each card a labelled Edit and Delete', async () => {
    await renderTab();
    expect(screen.getByRole('button', {name: 'Edit Home'}).textContent).toContain('Edit');
    expect(screen.getByRole('button', {name: 'Delete Home'}).textContent).toContain('Delete');
    expect(screen.getByRole('button', {name: 'Edit address'})).toBeTruthy();
  });

  it('does not crash for a place the shop\'s lists do not know', async () => {
    await renderTab([{...VILLAGE, division: 'Atlantis', district: 'Deep', thana: 'Sea'}]);
    expect(screen.getByText('Sea, Deep, Atlantis')).toBeTruthy();

    await click('Edit address');
    expect(screen.getByLabelText('Division').value).toBe(''); // asked again, not sent unseen
    expect(screen.getByLabelText('District').disabled).toBe(true);
  });

  it('says it could not read the list, with Try again that asks again', async () => {
    api.get.mockRejectedValueOnce(refused(['The shop is busy.'], 503));
    const store = makeStore();
    render(<Provider store={store}><AddressesTab /></Provider>);
    expect(await screen.findByText('The shop is busy.')).toBeTruthy();

    api.get.mockResolvedValueOnce({data: {data: [HOME]}});
    await click('Try again');
    expect(await screen.findByRole('heading', {name: 'Home'})).toBeTruthy();
    expect(screen.queryByText('The shop is busy.')).toBeNull();
  });

  it('keeps the list on the screen when a refresh fails', async () => {
    api.get.mockRejectedValue(refused(['The shop is busy.'], 503));
    render(<Provider store={makeStore([HOME])}><AddressesTab /></Provider>);
    await act(async () => {});
    expect(screen.getByRole('heading', {name: 'Home'})).toBeTruthy();
    expect(screen.queryByText('The shop is busy.')).toBeNull();
  });

  it('offers no more once the shop\'s limit of 20 is reached', async () => {
    const twenty = Array.from({length: 20}, (_, index) => ({...HOME, id: index + 1, title: `Place ${index + 1}`}));
    await renderTab(twenty);
    expect(screen.queryByRole('button', {name: /Add address/})).toBeNull();
    expect(screen.getByText(/You have saved 20 addresses/)).toBeTruthy();
  });
});

describe('Adding an address', () => {
  it('starts from a friendly empty state with a real button', async () => {
    await renderTab([]);
    expect(screen.getByText('No saved addresses yet')).toBeTruthy();
    expect(screen.queryByRole('button', {name: /^\+?\s*Add address$/})).toBeNull(); // the empty state has its own
    await click('Add your first address');
    expect(screen.getByRole('heading', {name: 'New address'})).toBeTruthy();
    expect(screen.queryByText('No saved addresses yet')).toBeNull();
  });

  it('has a labelled Add address button above the list, and hides it while the form is open', async () => {
    await renderTab();
    await click('Add address');
    expect(screen.getByRole('form', {name: 'New address'})).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Add address'})).toBeNull();
  });

  it('labels every box above it, with 48 px boxes, and shows the boxes of the chosen delivery area only', async () => {
    await renderTab();
    await click('Add address');
    expect(screen.getByLabelText('Title (optional)')).toBeTruthy();
    expect(screen.getByLabelText('Delivery area').className).toContain('h-12');
    expect(screen.queryByLabelText('Area in Dhaka')).toBeNull();
    expect(screen.queryByLabelText('Division')).toBeNull();

    pick('Delivery area', 'inside_dhaka');
    expect(screen.getByLabelText('Area in Dhaka')).toBeTruthy();
    expect(screen.queryByLabelText('Division')).toBeNull();

    pick('Delivery area', 'outside_dhaka');
    expect(screen.queryByLabelText('Area in Dhaka')).toBeNull();
    expect(screen.getByLabelText('Division')).toBeTruthy();
  });

  it('cascades division, district and upazila, and empties what hangs on a box that changed', async () => {
    await renderTab();
    await click('Add address');
    pick('Delivery area', 'outside_dhaka');
    expect(screen.getByLabelText('District').disabled).toBe(true);
    expect(screen.getByLabelText('Upazila / Thana').disabled).toBe(true);

    pick('Division', 'Barishal');
    expect(screen.getByLabelText('District').disabled).toBe(false);
    pick('District', 'Barguna');
    pick('Upazila / Thana', 'Amtali');
    expect(screen.getByLabelText('Upazila / Thana').value).toBe('Amtali');

    pick('Division', 'Dhaka');
    expect(screen.getByLabelText('District').value).toBe('');
    expect(screen.getByLabelText('Upazila / Thana').value).toBe('');
  });

  it('says every problem under its own box once Save is pressed and focuses the first', async () => {
    await renderTab();
    await click('Add address');
    expect(screen.queryByRole('alert')).toBeNull(); // nothing shouted before it was asked

    await click('Save address');
    expect(screen.getByText('Choose your delivery area')).toBeTruthy();
    expect(screen.getByText('Enter your full address (house, road, area)')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Delivery area'));
    expect(api.post).not.toHaveBeenCalled();

    pick('Delivery area', 'outside_dhaka');
    await click('Save address');
    expect(screen.getByText('Choose your division')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Division'));

    pick('Delivery area', 'inside_dhaka');
    pick('Area in Dhaka', 'Banani');
    expect(screen.queryByText('Choose your area in Dhaka')).toBeNull(); // fixed at once
    fireEvent.change(screen.getByLabelText('Full address'), {target: {value: 'x'.repeat(501)}});
    await click('Save address');
    expect(screen.getByText('Use 500 letters or fewer')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Full address'));
  });

  it('sends the address (trimmed, only the boxes that apply), closes after it was saved, and lists it', async () => {
    const created = {id: 9, title: 'Flat', shipping_type: 'inside_dhaka', address: 'Flat 4B, Road 11', area: 'Banani', division: '', district: '', thana: ''};
    api.post.mockResolvedValue({data: {data: created}});
    await renderTab([HOME]);
    await click('Add address');
    fireEvent.change(screen.getByLabelText('Title (optional)'), {target: {value: ' Flat '}});
    await fill();
    await click('Save address');

    expect(api.post).toHaveBeenCalledWith(
      '/accounts/addresses/',
      {title: 'Flat', shipping_type: 'inside_dhaka', address: 'Flat 4B, Road 11', area: 'Banani', division: '', district: '', thana: ''},
      expect.anything(),
    );
    expect(screen.queryByRole('form', {name: 'New address'})).toBeNull();
    expect(screen.getByRole('heading', {name: 'Flat'})).toBeTruthy();
    expect(screen.getByRole('heading', {name: /Saved addresses/}).textContent).toContain('(2)');
  });

  it('sends division, district and upazila for a place outside Dhaka, and no Dhaka area', async () => {
    api.post.mockResolvedValue({data: {data: {...VILLAGE, id: 3}}});
    await renderTab([]);
    await click('Add your first address');
    pick('Delivery area', 'outside_dhaka');
    pick('Division', 'Barishal');
    pick('District', 'Barguna');
    pick('Upazila / Thana', 'Amtali');
    fireEvent.change(screen.getByLabelText('Full address'), {target: {value: 'Near the bazaar'}});
    await click('Save address');
    expect(api.post.mock.calls[0][1]).toEqual({title: '', shipping_type: 'outside_dhaka', address: 'Near the bazaar', area: '', division: 'Barishal', district: 'Barguna', thana: 'Amtali'});
  });

  it('keeps the list on the screen while it saves (the button says so, not a skeleton over the list)', async () => {
    api.post.mockReturnValue(never());
    const {container} = await renderTab([HOME]);
    await click('Add address');
    await fill();
    await click('Save address');

    expect(screen.getByRole('button', {name: 'Saving…'}).disabled).toBe(true);
    expect(screen.getByRole('heading', {name: 'Home'})).toBeTruthy();
    expect(container.querySelector('.animate-pulse')).toBeNull();
  });

  it('stays open and says what the shop said when it refuses, with the boxes as they were', async () => {
    api.post.mockRejectedValue(refused(['You can save at most 20 addresses. Delete one to add another.']));
    await renderTab([HOME]);
    await click('Add address');
    await fill();
    await click('Save address');

    expect(within(screen.getByRole('form', {name: 'New address'})).getByText('You can save at most 20 addresses. Delete one to add another.')).toBeTruthy();
    expect(screen.getByLabelText('Full address').value).toBe('  Flat 4B, Road 11  ');
    expect(screen.getByRole('button', {name: 'Save address'}).disabled).toBe(false); // it can be tried again

    api.post.mockResolvedValue({data: {data: {...HOME, id: 8}}});
    await click('Save address');
    expect(screen.queryByRole('form', {name: 'New address'})).toBeNull();
  });

  it('says so when the shop cannot be reached', async () => {
    api.post.mockRejectedValue(new Error('Network Error'));
    await renderTab([HOME]);
    await click('Add address');
    await fill();
    await click('Save address');
    expect(screen.getByText('Could not reach the server. Check your connection and try again.')).toBeTruthy();
  });

  it('Cancel closes it without asking the shop anything', async () => {
    await renderTab([HOME]);
    await click('Add address');
    await click('Cancel');
    expect(screen.queryByRole('form', {name: 'New address'})).toBeNull();
    expect(api.post).not.toHaveBeenCalled();
  });
});

describe('Changing an address', () => {
  it('opens the same form, filled, in the card\'s place, and only one form at a time', async () => {
    await renderTab();
    await click('Edit Home');
    const form = screen.getByRole('form', {name: 'Edit address'});
    expect(within(form).getByLabelText('Title (optional)').value).toBe('Home');
    expect(within(form).getByLabelText('Delivery area').value).toBe('inside_dhaka');
    expect(within(form).getByLabelText('Area in Dhaka').value).toBe('Gulshan');
    expect(within(form).getByLabelText('Full address').value).toBe('House 5, Road 3');
    expect(screen.queryByRole('heading', {name: 'Home'})).toBeNull(); // the card gave its place to the form

    await click('Add address');
    expect(screen.queryByRole('form', {name: 'Edit address'})).toBeNull(); // the other form closed
    expect(screen.getByRole('form', {name: 'New address'})).toBeTruthy();
  });

  it('fills the cascade of an address outside Dhaka', async () => {
    await renderTab();
    await click('Edit address');
    expect(screen.getByLabelText('Division').value).toBe('Barishal');
    expect(screen.getByLabelText('District').value).toBe('Barguna');
    expect(screen.getByLabelText('Upazila / Thana').value).toBe('Amtali');
  });

  it('sends the whole address to its own URL and shows the change', async () => {
    api.put.mockResolvedValue({data: {data: {...HOME, address: 'House 9, Road 3'}}});
    await renderTab();
    await click('Edit Home');
    fireEvent.change(screen.getByLabelText('Full address'), {target: {value: 'House 9, Road 3'}});
    await click('Save changes');

    expect(api.put).toHaveBeenCalledWith(
      '/accounts/addresses/1/',
      {title: 'Home', shipping_type: 'inside_dhaka', address: 'House 9, Road 3', area: 'Gulshan', division: '', district: '', thana: ''},
      expect.anything(),
    );
    expect(screen.queryByRole('form', {name: 'Edit address'})).toBeNull();
    expect(screen.getByText('House 9, Road 3')).toBeTruthy();
  });

  it('clears the boxes of the old delivery area when the area is switched', async () => {
    api.put.mockResolvedValue({data: {data: {...VILLAGE, shipping_type: 'inside_dhaka', area: 'Banani', division: '', district: '', thana: ''}}});
    await renderTab();
    await click('Edit address');
    pick('Delivery area', 'inside_dhaka');
    pick('Area in Dhaka', 'Banani');
    await click('Save changes');
    expect(api.put.mock.calls[0][1]).toMatchObject({shipping_type: 'inside_dhaka', area: 'Banani', division: '', district: '', thana: ''});
  });

  it('says nothing has changed, and asks the shop nothing, when Save is pressed without a change', async () => {
    await renderTab();
    await click('Edit Home');
    await click('Save changes');
    expect(screen.getByText('Nothing has changed yet.')).toBeTruthy();
    expect(api.put).not.toHaveBeenCalled();
  });

  it('says what the shop said when it refuses, and stays open', async () => {
    api.put.mockRejectedValue(refused(['Not found.'], 404));
    await renderTab();
    await click('Edit Home');
    fireEvent.change(screen.getByLabelText('Full address'), {target: {value: 'Elsewhere'}});
    await click('Save changes');
    expect(within(screen.getByRole('form', {name: 'Edit address'})).getByText('Not found.')).toBeTruthy();
  });

  it('Cancel brings the card back unchanged', async () => {
    await renderTab();
    await click('Edit Home');
    fireEvent.change(screen.getByLabelText('Full address'), {target: {value: 'Elsewhere'}});
    await click('Cancel');
    expect(screen.getByText('House 5, Road 3')).toBeTruthy();
    expect(api.put).not.toHaveBeenCalled();
  });
});

describe('Deleting an address', () => {
  it('asks in the card, and Keep address puts things back', async () => {
    await renderTab();
    await click('Delete Home');
    const group = screen.getByRole('group', {name: 'Delete Home?'});
    expect(within(group).getByText('Delete this address?')).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'Edit Home'})).toBeNull();

    await click('Keep address');
    expect(screen.queryByText('Delete this address?')).toBeNull();
    expect(screen.getByRole('button', {name: 'Delete Home'})).toBeTruthy();
    expect(api.delete).not.toHaveBeenCalled();
  });

  it('removes it after Yes, delete', async () => {
    api.delete.mockResolvedValue({data: {data: null}});
    await renderTab();
    await click('Delete Home');
    await click('Yes, delete');
    expect(api.delete).toHaveBeenCalledWith('/accounts/addresses/1/', expect.anything());
    expect(screen.queryByRole('heading', {name: 'Home'})).toBeNull();
    expect(screen.getByRole('heading', {name: 'Address'})).toBeTruthy();
  });

  it('says what the shop said in the card when it refuses, and the address stays', async () => {
    api.delete.mockRejectedValue(refused(['Not found.'], 404));
    await renderTab();
    await click('Delete Home');
    await click('Yes, delete');
    const card = screen.getByRole('heading', {name: 'Home'}).closest('article');
    expect(within(card).getByText('Not found.')).toBeTruthy();
    expect(within(card).getByRole('button', {name: 'Delete Home'})).toBeTruthy(); // it can be tried again
  });
});

describe('The slice', () => {
  const post = (data) => api.post.mockResolvedValue({data: {data}});

  it('adds, changes and removes an address in the list, and reads it back', async () => {
    const store = makeStore([HOME]);
    post({...VILLAGE, id: 5});
    await store.dispatch(handleAddressCreate({title: ''}));
    expect(store.getState().profile.addresses.map((item) => item.id)).toEqual([1, 5]);

    api.put.mockResolvedValue({data: {data: {...HOME, title: 'Flat'}}});
    await store.dispatch(handleAddressUpdate({id: 1, title: 'Flat'}));
    expect(store.getState().profile.addresses[0].title).toBe('Flat');
    expect(api.put.mock.calls[0][1]).toEqual({title: 'Flat'}); // the id is in the URL, not in the body

    api.delete.mockResolvedValue({data: {data: null}});
    await store.dispatch(handleAddressDelete(1));
    expect(store.getState().profile.addresses.map((item) => item.id)).toEqual([5]);

    api.get.mockResolvedValue({data: {data: [HOME, VILLAGE]}});
    await store.dispatch(handleGetAddress());
    expect(store.getState().profile.addresses).toHaveLength(2);
    expect(store.getState().profile.addressesLoaded).toBe(true);
  });

  it('leaves the list alone, and hands back sentences, when the shop refuses', async () => {
    const store = makeStore([HOME]);
    api.post.mockRejectedValue(refused(['No.']));
    const result = await store.dispatch(handleAddressCreate({}));
    expect(result.payload).toEqual({errors: ['No.']});
    expect(store.getState().profile.addresses).toEqual([HOME]);
    expect(store.getState().profile.addressError).toBeNull(); // a refused save is not "the list could not be read"
  });

  it('is emptied when the customer logs out', async () => {
    const store = makeStore([HOME]);
    store.dispatch(logoutUser.fulfilled());
    expect(store.getState().profile.addresses).toEqual([]);
    expect(store.getState().profile.addressesLoaded).toBe(false);
  });

  it('no longer holds the form\'s state (it is the form\'s own)', () => {
    const state = profileReducer(undefined, {type: '@@init'});
    ['addressFormData', 'touched', 'errors', 'districts', 'upazilas', 'isAddAddress'].forEach((name) => expect(state).not.toHaveProperty(name));
  });
});
