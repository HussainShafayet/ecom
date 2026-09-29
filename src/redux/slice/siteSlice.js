// src/redux/slice/siteSlice.js
// The shop's identity (name, logo, contact details, social links, trust badges, announcement bar, footer pages), read once when the
// storefront opens. Until it arrives, and if it never does, the empty values below keep every place that reads it
// working: nothing is drawn for what is missing.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getSite } from '../../services/siteService';

export const EMPTY_SITE = {
  name: '',
  tagline: '',
  logo: null,
  announcement: null,
  contact: { email: '', phone: '', address: '', opening_hours: '', map_url: '' },
  social_links: [],
  trust_badges: [],
  footer_pages: { company: [], service: [], legal: [] },
};

const initialState = {
  site: EMPTY_SITE,
  isLoaded: false,
  isLoading: false,
  error: null,
};

export const handleFetchSite = createAsyncThunk('site/handleFetchSite', async (_, { rejectWithValue }) => {
  try {
    const response = await getSite();
    return response?.data?.data?.site;
  } catch (error) {
    return rejectWithValue(error?.response?.data || { error: 'Could not load the shop details.' });
  }
});

const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(handleFetchSite.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(handleFetchSite.fulfilled, (state, action) => {
        const site = action.payload || {};
        state.isLoading = false;
        state.isLoaded = true;
        state.error = null;
        state.site = {
          ...EMPTY_SITE,
          ...site,
          contact: { ...EMPTY_SITE.contact, ...site.contact },
          footer_pages: { ...EMPTY_SITE.footer_pages, ...site.footer_pages },
          social_links: site.social_links || [],
          trust_badges: site.trust_badges || [],
        };
      })
      .addCase(handleFetchSite.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.error || 'Could not load the shop details.';
      });
  },
});

export const selectSite = (state) => state.site.site;

export default siteSlice.reducer;
