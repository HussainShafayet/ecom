// The shop's band, one component for the sign-in pages, the account page and the page-not-found page: the shop's logo and name (and tagline)
// from the site settings, the same gradient and decoration, whatever sits in it under the logo row.
import React from 'react';
import {beforeEach, describe, expect, it} from 'vitest';
import {cleanup, render, screen} from '@testing-library/react';
import {Provider} from 'react-redux';
import {configureStore} from '@reduxjs/toolkit';

import siteReducer, {EMPTY_SITE} from '../redux/slice/siteSlice';
import {ShopBand} from '../components/common';

const init = (reducer) => reducer(undefined, {type: '@@init'});
const renderBand = (props = {}, site = {name: 'Rahim Store', tagline: 'Everyday things', logo: 'https://shop.test/logo.png'}, children = null) => {
  const store = configureStore({reducer: {site: siteReducer}, preloadedState: {site: {...init(siteReducer), site: {...EMPTY_SITE, ...site}}}});
  return render(<Provider store={store}><ShopBand {...props}>{children}</ShopBand></Provider>);
};

beforeEach(() => cleanup());

describe('The shop band', () => {
  it('shows the shop\'s logo, name and tagline from the site settings', () => {
    renderBand();
    expect(screen.getByRole('img', {name: 'Rahim Store logo'}).getAttribute('src')).toBe('https://shop.test/logo.png');
    expect(screen.getByText('Rahim Store')).toBeTruthy();
    expect(screen.getByText('Everyday things')).toBeTruthy();
  });

  it('has the bundled logo and the fallback name until the site settings have arrived', () => {
    renderBand({fallbackName: 'Welcome'}, {name: '', tagline: '', logo: null});
    expect(screen.getByRole('img', {name: 'Shop logo'}).getAttribute('src')).toBe('/static image/gocart-logo.svg');
    expect(screen.getByText('Welcome')).toBeTruthy();
  });

  it('is the gradient with decoration that no screen reader should read', () => {
    const {container} = renderBand();
    const band = container.firstChild;
    expect(band.className).toContain('from-blue-600');
    expect(band.className).toContain('to-purple-600');
    const decoration = [...band.querySelectorAll(':scope > span')];
    expect(decoration).toHaveLength(3);
    expect(decoration.every((span) => span.getAttribute('aria-hidden') === 'true')).toBe(true);
  });

  it('takes its size and corners from the page, and draws what the page puts in it under the logo row', () => {
    const {container} = renderBand({className: 'rounded-b-3xl px-5 pb-20 pt-5'}, undefined, <p className="relative">404</p>);
    expect(container.firstChild.className).toContain('rounded-b-3xl');
    expect(container.firstChild.className).toContain('pb-20');
    expect(screen.getByText('404')).toBeTruthy();
  });

  it('has a compact form for the account page: a small logo and only the name', () => {
    renderBand({compact: true});
    expect(screen.getByText('Rahim Store')).toBeTruthy();
    expect(screen.queryByText('Everyday things')).toBeNull();
    expect(screen.getByRole('img', {name: 'Rahim Store logo'}).className).toContain('h-8');
  });

  it('works in a store without the site slice (a page rendered alone): the fallbacks', () => {
    const store = configureStore({reducer: {other: (state = {}) => state}});
    render(<Provider store={store}><ShopBand fallbackName="My account" compact /></Provider>);
    expect(screen.getByText('My account')).toBeTruthy();
  });
});
