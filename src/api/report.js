// src/api/report.js
// Telling the customer that a request failed, and taking it back once the same part of the page works again.
import { clearSectionError, setSectionError } from '../redux/slice/globalErrorSlice';
import { pushToast } from '../redux/slice/toastSlice';
import { apiErrorMessage } from './errors';

// In the part of the page that made the request (its `section`, which that part shows where it would have been), or,
// for a request that names no part, as a toast. Never a page-wide screen: one failed request must not take the shop away.
export const reportFailure = (store, error, message = apiErrorMessage(error)) => {
  const section = error?.config?.section;
  if (section) store.dispatch(setSectionError({ section, error: message }));
  else store.dispatch(pushToast(message, 'error'));
};

// A request of `section` worked, so whatever error that part was still showing is out of date.
export const clearFailure = (store, section) => {
  if (section && store.getState().globalError?.sectionErrors?.[section]) store.dispatch(clearSectionError(section));
};
