// The account page, phone first: the customer's picture (their initial until they add one), name and phone at the top, three tabs
// with their names written out, the details as a list that becomes a form, and a sheet for the code a NEW phone number or e-mail
// must be verified with. Every problem is said under its own box (no browser alert). Real slices, a mocked authenticated client.
import React from 'react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';
import {MemoryRouter} from 'react-router-dom';

import profileReducer, {handleProfileUpdate, setInfoEditing} from '../redux/slice/profileSlice';
import authReducer, {logoutUser, sessionEnded} from '../redux/slice/authSlice';
import globalErrorReducer from '../redux/slice/globalErrorSlice';
import toastReducer from '../redux/slice/toastSlice';
import wishListReducer from '../redux/slice/wishlistSlice';
import cartReducer from '../redux/slice/cartSlice';
import orderReducer from '../redux/slice/orderSlice';
import api from '../api/axiosSetup';
import Profile from '../pages/user/Profile';

vi.setConfig({testTimeout: 15000});

vi.mock('../api/axiosSetup', () => ({default: {get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn()}}));

const PROFILE = {
  name: 'Rahim Uddin', username: 'rahim', email: 'rahim@example.com', phone_number: '+8801712345678',
  date_of_birth: '2000-05-01', gender: 'male', profile_picture: null,
};
const sent = (data = {}) => ({data: {success: true, message: 'OTP sent to +88018****5678.', data: {token: 'tok-1', resend_after: 45, expires_in: 300, length: 6, ...data}}});
const refused = (errors, extra = {}, status = 400) => ({response: {status, headers: {}, data: {success: false, errors, ...extra}}});

const makeStore = (profile = undefined, preloaded = {}) => configureStore({
  reducer: {profile: profileReducer, auth: authReducer, globalError: globalErrorReducer, toast: toastReducer, wishList: wishListReducer, cart: cartReducer, order: orderReducer},
  preloadedState: {
    auth: {...authReducer(undefined, {type: '@@init'}), isAuthenticated: true},
    ...(profile ? {profile: {...profileReducer(undefined, {type: '@@init'}), profile}} : {}),
    ...preloaded,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({serializableCheck: false}),
});
const renderPage = (store = makeStore()) => {
  const utils = render(<Provider store={store}><MemoryRouter><Profile /></MemoryRouter></Provider>);
  return {store, ...utils};
};
const loaded = async (store) => {
  const utils = renderPage(store);
  await screen.findByRole('button', {name: 'Edit information'});
  return utils;
};
const type = (label, value) => fireEvent.change(screen.getByLabelText(label), {target: {value}});
const click = async (name) => { await act(async () => { fireEvent.click(screen.getByRole('button', {name})); }); };
const editing = async () => {
  api.get.mockResolvedValue({data: {data: PROFILE}});
  const utils = await loaded();
  await click('Edit information');
  return utils;
};

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.spyOn(window, 'alert').mockImplementation(() => {});
  api.get.mockResolvedValue({data: {data: PROFILE}});
});
afterEach(() => {
  expect(window.alert).not.toHaveBeenCalled(); // nothing on this page speaks through a browser dialog any more
});

describe('The top of the page and the way in', () => {
  it('shows the name and phone, and the customer\'s initial instead of a picture from another site', async () => {
    const {container} = await loaded();
    expect(screen.getByRole('heading', {name: 'Rahim Uddin', level: 1})).toBeTruthy();
    expect(screen.getAllByText('+8801712345678').length).toBeGreaterThan(0);
    expect(screen.getByText('R')).toBeTruthy();
    expect(container.querySelector('img[alt=""]')).toBeNull();
    expect(screen.getByAltText('Shop logo')).toBeTruthy(); // the band carries the shop's own logo
    expect(screen.getByText('Add a photo')).toBeTruthy();
  });

  it('shows the picture when there is one', async () => {
    api.get.mockResolvedValue({data: {data: {...PROFILE, profile_picture: 'data:image/png;base64,iVBORw0KGgo='}}});
    const {container} = await loaded();
    expect(container.querySelector('img[alt=""]').getAttribute('src')).toBe('data:image/png;base64,iVBORw0KGgo=');
    expect(screen.getByText('Change photo')).toBeTruthy();
  });

  it('links to the orders', async () => {
    await loaded();
    expect(screen.getByRole('link', {name: /My Orders/}).getAttribute('href')).toBe('/orders');
  });

  it('has three tabs with their names written out, the first one selected', async () => {
    await loaded();
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Profile', 'Addresses', 'Wishlist']);
    expect(tabs.map((tab) => tab.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);
    expect(screen.getByRole('tabpanel').getAttribute('aria-labelledby')).toBe('tab-overview');
  });

  it('loads the addresses when their tab is opened', async () => {
    api.get.mockImplementation((url) => Promise.resolve({data: {data: url.includes('addresses') ? [] : PROFILE}}));
    await loaded();
    await act(async () => { fireEvent.click(screen.getByRole('tab', {name: 'Addresses'})); });
    expect(api.get).toHaveBeenCalledWith('/accounts/addresses/', expect.anything());
    expect(screen.getByRole('tab', {name: 'Addresses'}).getAttribute('aria-selected')).toBe('true');
  });

  it('shows a skeleton on the first load, but keeps what it has while it refreshes', async () => {
    api.get.mockReturnValue(new Promise(() => {}));
    const first = renderPage();
    expect(first.container.querySelector('.animate-pulse')).toBeTruthy();
    cleanup();

    const again = renderPage(makeStore(PROFILE)); // already loaded once, the refresh is still on its way
    expect(again.container.querySelector('.animate-pulse')).toBeNull();
    expect(screen.getByRole('button', {name: 'Edit information'})).toBeTruthy();
  });

  it('says it could not load, with Try again that asks again', async () => {
    api.get.mockRejectedValueOnce(refused(['The shop is busy.'], {}, 503));
    renderPage();
    expect(await screen.findByText('The shop is busy.')).toBeTruthy();

    api.get.mockResolvedValueOnce({data: {data: PROFILE}});
    await click('Try again');
    expect(await screen.findByRole('button', {name: 'Edit information'})).toBeTruthy();
  });

  it('never tries to draw an error it cannot (an object) as a sentence', async () => {
    api.get.mockRejectedValueOnce({response: {status: 500, data: {detail: 'boom'}}});
    renderPage();
    expect(await screen.findByText('Something went wrong!')).toBeTruthy();
  });
});

describe('The details', () => {
  it('reads as a list: label above the value, the birthday in words, the gender capitalised', async () => {
    await loaded();
    const list = screen.getByText('Name').closest('dl');
    expect(within(list).getByText('Rahim Uddin')).toBeTruthy();
    expect(within(list).getByText('rahim@example.com')).toBeTruthy();
    expect(within(list).getByText(/^(1 May 2000|May 1, 2000)$/)).toBeTruthy(); // the words of the browser's language
    expect(within(list).getByText('Male')).toBeTruthy();
  });

  it('turns into a form with 48 px controls, a labelled phone box with a fixed +880, and buttons that fill the width', async () => {
    await editing();
    expect(screen.getByLabelText('Name').className).toContain('h-12');
    expect(screen.getByLabelText('Phone number').value).toBe('1712345678');
    expect(screen.getByText('+880')).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Save changes'}).className).toContain('w-full');
    expect(screen.getByRole('button', {name: 'Cancel'}).className).toContain('w-full');
  });

  it('asks for a name, with the customer taken to the box', async () => {
    await editing();
    type('Name', '  ');
    await click('Save changes');
    expect(screen.getByText('Enter your name')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Name'));
    expect(api.put).not.toHaveBeenCalled();
  });

  it('checks the user name and the e-mail before asking the shop', async () => {
    await editing();
    type(/User name/, 'a b');
    type(/E-mail/, 'nope');
    await click('Save changes');
    expect(screen.getByText('Use 3 to 50 letters, numbers, dots, dashes or underscores')).toBeTruthy();
    expect(screen.getByText('Enter a valid e-mail address, or leave it empty')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText(/User name/));
    expect(api.put).not.toHaveBeenCalled();
  });

  it('says so when nothing changed, and does not call the shop', async () => {
    await editing();
    await click('Save changes');
    expect(screen.getByText('Nothing has changed yet.')).toBeTruthy();
    expect(api.put).not.toHaveBeenCalled();
  });

  it('sends only what changed, as JSON, and goes back to the list with a toast', async () => {
    api.put.mockResolvedValue({data: {data: {...PROFILE, name: 'Rahim Khan'}}});
    const {store} = await editing();
    type('Name', 'Rahim Khan');

    await click('Save changes');

    expect(api.put).toHaveBeenCalledWith('/accounts/profile/', {name: 'Rahim Khan'}, expect.anything());
    expect(api.put.mock.calls[0][1] instanceof FormData).toBe(false);
    expect(await screen.findByRole('button', {name: 'Edit information'})).toBeTruthy();
    expect(screen.getAllByText('Rahim Khan').length).toBeGreaterThan(0);
    expect(store.getState().toast.items.some((toast) => toast.message === 'Profile updated')).toBe(true);
  });

  it('can remove the e-mail (JSON says "" out loud; a multipart form could not) without a code', async () => {
    api.put.mockResolvedValue({data: {data: {...PROFILE, email: null}}});
    await editing();
    type(/E-mail/, '');
    expect(screen.queryByRole('button', {name: 'Send code'})).toBeNull();

    await click('Save changes');

    expect(api.put).toHaveBeenCalledWith('/accounts/profile/', {email: ''}, expect.anything());
  });

  it('can clear the birthday', async () => {
    api.put.mockResolvedValue({data: {data: {...PROFILE, date_of_birth: null}}});
    await editing();
    type('Date of birth (optional)', '');
    await click('Save changes');
    expect(api.put).toHaveBeenCalledWith('/accounts/profile/', {date_of_birth: null}, expect.anything());
  });

  it('puts what the shop said about a field under that field, and the rest above Save; editing the field clears it', async () => {
    api.put.mockRejectedValue(refused(['Something is wrong.'], {field_errors: {username: ['That user name is taken.']}}));
    await editing();
    type(/User name/, 'taken_one');
    await click('Save changes');

    const under = await screen.findByText('That user name is taken.');
    expect(under.id).toBe('profile-username-error');
    expect(screen.getByText('Something is wrong.')).toBeTruthy();

    type(/User name/, 'another_one');
    expect(screen.queryByText('That user name is taken.')).toBeNull();
  });

  it('starts clean each time: Cancel throws the changes away', async () => {
    await editing();
    type('Name', 'Somebody Else');
    await click('Cancel');
    await click('Edit information');
    expect(screen.getByLabelText('Name').value).toBe('Rahim Uddin');
  });
});

describe('A new phone number or e-mail is verified with a code first', () => {
  const newPhone = async () => {
    await editing();
    type('Phone number', '01812345678'); // however it is typed, it is the ten digits after +880
  };

  it('offers a code under the box that changed, and will not save it without one', async () => {
    await newPhone();
    expect(screen.getByLabelText('Phone number').value).toBe('1812345678');
    expect(screen.getByText('A new number needs a code before it can be saved.')).toBeTruthy();

    await click('Save changes');

    expect(screen.getByText('Verify this number with a code first')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Phone number'));
    expect(api.put).not.toHaveBeenCalled();
  });

  it('offers no code for a number that did not change, or one that is not a number yet', async () => {
    await editing();
    expect(screen.queryByRole('button', {name: 'Send code'})).toBeNull();
    type('Phone number', '18123');
    expect(screen.queryByRole('button', {name: 'Send code'})).toBeNull();
  });

  it('asks for the code in a sheet fixed to the screen (not lost at the top of the page), with the boxes the backend said', async () => {
    api.post.mockResolvedValue(sent({length: 4, resend_after: 45}));
    await newPhone();

    await click('Send code');

    expect(api.post).toHaveBeenCalledWith('/accounts/request-otp/', {phone_number: '+8801812345678'}, expect.anything());
    const sheet = await screen.findByRole('dialog', {name: 'Verify your new phone number'});
    expect(sheet.getAttribute('aria-modal')).toBe('true');
    expect(sheet.parentElement.className).toContain('fixed inset-0');
    expect(within(sheet).getByText('OTP sent to +88018****5678.')).toBeTruthy();
    expect(within(sheet).getByLabelText('4-digit code')).toBeTruthy();
    expect(within(sheet).getByRole('button', {name: 'Resend code in 45s'}).disabled).toBe(true);
    expect(document.activeElement).toBe(within(sheet).getByLabelText('4-digit code'));
  });

  it('is left with Cancel (which does not submit anything) or with Esc', async () => {
    api.post.mockResolvedValue(sent());
    await newPhone();
    await click('Send code');
    const sheet = await screen.findByRole('dialog');

    fireEvent.click(within(sheet).getByRole('button', {name: 'Cancel'}));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(api.post).toHaveBeenCalledTimes(1); // only the request for the code

    await click('Send code');
    fireEvent.keyDown(await screen.findByRole('dialog'), {key: 'Escape'});
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps Tab inside the sheet, and gives the focus back to the button that opened it', async () => {
    api.post.mockResolvedValue(sent());
    await newPhone();
    const opener = screen.getByRole('button', {name: 'Send code'});
    opener.focus();
    await click('Send code');
    const sheet = await screen.findByRole('dialog');
    const code = within(sheet).getByLabelText('6-digit code');
    const cancel = within(sheet).getByRole('button', {name: 'Cancel'});

    cancel.focus(); // the last control: Tab goes round to the first, and Shift+Tab back
    fireEvent.keyDown(cancel, {key: 'Tab'});
    expect(document.activeElement).toBe(code);
    fireEvent.keyDown(code, {key: 'Tab', shiftKey: true});
    expect(document.activeElement).toBe(cancel);

    fireEvent.keyDown(cancel, {key: 'Escape'});
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('says a wrong code under the boxes, then takes the right one, and the number can be saved', async () => {
    api.post.mockResolvedValueOnce(sent());
    api.put.mockResolvedValue({data: {data: {...PROFILE, phone_number: '+8801812345678'}}});
    await newPhone();
    await click('Send code');
    const sheet = await screen.findByRole('dialog');

    api.post.mockRejectedValueOnce(refused(['Incorrect code. 4 attempts left.']));
    fireEvent.change(within(sheet).getByLabelText('6-digit code'), {target: {value: '111111'}});
    await click('Verify');
    expect(await within(sheet).findByText('Incorrect code. 4 attempts left.')).toBeTruthy();
    expect(api.post).toHaveBeenLastCalledWith('/accounts/verify-otp-for-profile/', {token: 'tok-1', otp: '111111'}, expect.anything());

    fireEvent.change(within(sheet).getByLabelText('6-digit code'), {target: {value: '22222'}});
    expect(within(sheet).queryByText('Incorrect code. 4 attempts left.')).toBeNull(); // about the old code

    api.post.mockResolvedValueOnce({data: {data: {field: 'phone_number', value: '+8801812345678'}}});
    fireEvent.change(within(sheet).getByLabelText('6-digit code'), {target: {value: '222222'}});
    await click('Verify');

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('This number is verified')).toBeTruthy();
    await click('Save changes');
    expect(api.put).toHaveBeenCalledWith('/accounts/profile/', {phone_number: '+8801812345678'}, expect.anything());
  });

  it('asks for the right number of digits before asking the shop', async () => {
    api.post.mockResolvedValue(sent());
    await newPhone();
    await click('Send code');
    const sheet = await screen.findByRole('dialog');
    fireEvent.change(within(sheet).getByLabelText('6-digit code'), {target: {value: '123'}});

    await click('Verify');

    expect(within(sheet).getByText('Enter the 6-digit code we sent you')).toBeTruthy();
    expect(api.post).toHaveBeenCalledTimes(1);
  });

  it('asks for a new code with Resend, once the wait is over', async () => {
    api.post.mockResolvedValue(sent({resend_after: 1}));
    await newPhone();
    await click('Send code');
    const sheet = await screen.findByRole('dialog');
    expect(within(sheet).getByRole('button', {name: 'Resend code in 1s'}).disabled).toBe(true);

    const resend = await within(sheet).findByRole('button', {name: 'Resend code'}, {timeout: 3000});
    await act(async () => { fireEvent.click(resend); });

    expect(api.post).toHaveBeenLastCalledWith('/accounts/request-otp/', {phone_number: '+8801812345678'}, expect.anything());
    expect(api.post).toHaveBeenCalledTimes(2);
    expect(within(sheet).getByRole('button', {name: 'Resend code in 1s'})).toBeTruthy(); // counting again
  });

  it('says how long to wait when too many codes were asked for, in words and not in DRF\'s sentence', async () => {
    api.post.mockRejectedValue(refused(['Request was throttled. Expected available in 1500 seconds.'], {}, 429));
    await newPhone();

    await click('Send code');

    expect(await screen.findByText('You have asked for too many codes. Please try again in 25 minutes.')).toBeTruthy();
    expect(document.body.textContent).not.toContain('Request was throttled');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('survives the shop not answering at all (no response, no crash)', async () => {
    api.post.mockRejectedValue(new Error('Network Error'));
    await newPhone();

    await click('Send code');

    expect(await screen.findByText('Failed to send the code.')).toBeTruthy();
  });

  it('does the same for a new e-mail', async () => {
    api.post.mockResolvedValue(sent());
    await editing();
    type(/E-mail/, 'new@example.com');
    await click('Save changes');
    expect(screen.getByText('Verify this e-mail with a code first')).toBeTruthy();

    await click('Send code');

    expect(api.post).toHaveBeenCalledWith('/accounts/request-otp/', {email: 'new@example.com'}, expect.anything());
    expect(await screen.findByRole('dialog', {name: 'Verify your new e-mail'})).toBeTruthy();
  });
});

describe('The picture', () => {
  const pick = (file) => fireEvent.change(screen.getByLabelText(/Change profile picture/), {target: {files: [file]}});
  const png = (name = 'me.png', bytes = 10, type = 'image/png') => new File([new ArrayBuffer(bytes)], name, {type});

  it('turns down what the backend would (a GIF, more than 5 MB) before uploading anything', async () => {
    await loaded();
    pick(png('a.gif', 10, 'image/gif'));
    expect(screen.getByText('Choose a JPEG, PNG or WebP picture.')).toBeTruthy();
    pick(png('big.png', 6 * 1024 * 1024));
    expect(screen.getByText('That picture is too big. The most is 5 MB.')).toBeTruthy();
    expect(api.put).not.toHaveBeenCalled();
  });

  it('sends a good one as a multipart form with the file, shows it at once and keeps the edit form open', async () => {
    api.put.mockResolvedValue({data: {data: {...PROFILE, profile_picture: 'data:image/png;base64,iVBORw0KGgo='}}});
    const {container} = await editing();
    type('Name', 'Half typed');

    pick(png());

    await waitFor(() => expect(api.put).toHaveBeenCalled());
    const [url, body] = api.put.mock.calls[0];
    expect(url).toBe('/accounts/profile/');
    expect(body instanceof FormData).toBe(true);
    expect(body.get('profile_picture').name).toBe('me.png');
    await waitFor(() => expect(container.querySelector('img[alt=""]').getAttribute('src')).toBe('data:image/png;base64,iVBORw0KGgo='));
    expect(screen.getByLabelText('Name').value).toBe('Half typed'); // the picture did not throw the form away
  });

  it('puts the old picture back and says why when the shop refuses the new one', async () => {
    api.put.mockRejectedValue(refused(['The picture is not a real JPEG, PNG or WebP image.']));
    const {container} = await loaded();

    pick(png());

    expect(await screen.findByText('The picture is not a real JPEG, PNG or WebP image.')).toBeTruthy();
    await waitFor(() => expect(container.querySelector('img[alt=""]')).toBeNull()); // back to the initial
  });
});

describe('The profile state', () => {
  it('a saved form ends editing and spends the verifications; a picture does not', async () => {
    api.put.mockResolvedValue({data: {data: PROFILE}});
    const store = makeStore(PROFILE);
    store.dispatch(setInfoEditing(true));

    await store.dispatch(handleProfileUpdate(new FormData()));
    expect(store.getState().profile.infoEditing).toBe(true);

    await store.dispatch(handleProfileUpdate({name: 'X'}));
    expect(store.getState().profile.infoEditing).toBe(false);
  });

  it.each([['logs out', logoutUser.fulfilled()], ['loses the session', sessionEnded()]])('is emptied when the customer %s, so the next person on this browser sees nothing of it', (_, action) => {
    const store = makeStore(PROFILE);
    store.dispatch(action);
    expect(store.getState().profile.profile).toBeNull();
    expect(store.getState().profile.addresses).toEqual([]);
  });
});

describe('The numbers beside My Orders and Wishlist', () => {
  // the shop's answers by address: the profile, the order list (only its `count` is read), the wishlist
  const answers = ({orders = 12, wishlist = [{id: 1}, {id: 2}, {id: 3}]} = {}) => {
    api.get.mockImplementation((url) => {
      if (url.startsWith('/orders/')) return typeof orders === 'function' ? orders() : Promise.resolve({data: {data: {count: orders, results: []}}});
      if (url.startsWith('/accounts/favourite/')) return typeof wishlist === 'function' ? wishlist() : Promise.resolve({data: {data: wishlist}});
      return Promise.resolve({data: {data: PROFILE}});
    });
  };
  const orderCard = () => screen.getByRole('link', {name: /My Orders/});
  const wishlistTab = () => screen.getAllByRole('tab')[2];

  it('says how many orders and wishlist items there are, once the shop has answered', async () => {
    answers();
    await loaded();
    await waitFor(() => expect(orderCard().textContent).toContain('12 orders'));
    expect(orderCard().textContent).toContain('Track, cancel or look back'); // the sentence stays
    await waitFor(() => expect(wishlistTab().textContent).toContain('3 items'));
    expect(wishlistTab().textContent).toContain('Wishlist');
    expect(api.get).toHaveBeenCalledWith('/orders/?page=1&page_size=1', expect.objectContaining({section: 'orders-total'}));
  });

  it('says "1 order" and "1 item", not "1 orders"', async () => {
    answers({orders: 1, wishlist: [{id: 9}]});
    await loaded();
    await waitFor(() => expect(orderCard().textContent).toContain('1 order'));
    expect(orderCard().textContent).not.toContain('1 orders');
    await waitFor(() => expect(wishlistTab().textContent).toContain('1 item'));
    expect(wishlistTab().textContent).not.toContain('1 items');
  });

  it('draws no number for no orders and an empty wishlist', async () => {
    answers({orders: 0, wishlist: []});
    await loaded();
    await act(async () => {}); // let the two answers land
    expect(orderCard().textContent).toBe('My OrdersTrack, cancel or look back at what you ordered');
    expect(wishlistTab().textContent).toBe('Wishlist');
  });

  it('draws no number, and no error, when the shop could not say', async () => {
    answers({orders: () => Promise.reject(refused(['The shop is busy.'], {}, 503)), wishlist: () => Promise.reject(refused(['The shop is busy.'], {}, 503))});
    await loaded();
    await act(async () => {});
    expect(orderCard().textContent).toBe('My OrdersTrack, cancel or look back at what you ordered');
    expect(wishlistTab().textContent).toBe('Wishlist');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByText('The shop is busy.')).toBeNull();
  });

  it('does not guess from what the phone remembers while the shop has not answered', async () => {
    answers({wishlist: () => new Promise(() => {})});
    const remembered = {...wishListReducer(undefined, {type: '@@init'}), items: [{id: 1}, {id: 2}]};
    await loaded(makeStore(PROFILE, {wishList: remembered}));
    await act(async () => {});
    expect(wishlistTab().textContent).toBe('Wishlist');
  });

  it('keeps the orders page\'s own list and filter as they were', async () => {
    answers({orders: 12});
    const mine = {...orderReducer(undefined, {type: '@@init'}), orders: [{order_id: 'A1'}], ordersCount: 1, ordersStatus: 'delivered'};
    const {store} = await loaded(makeStore(PROFILE, {order: mine}));
    await waitFor(() => expect(store.getState().order.ordersTotal).toBe(12));
    const after = store.getState().order;
    expect(after.orders).toEqual([{order_id: 'A1'}]);
    expect(after.ordersCount).toBe(1);
    expect(after.ordersStatus).toBe('delivered');
  });

  it('forgets the number with the customer (a next person on this browser must not see it)', async () => {
    answers();
    const {store} = await loaded();
    await waitFor(() => expect(store.getState().order.ordersTotal).toBe(12));
    await act(async () => { store.dispatch({type: logoutUser.fulfilled.type}); });
    expect(store.getState().order.ordersTotal).toBeNull();
  });
});
