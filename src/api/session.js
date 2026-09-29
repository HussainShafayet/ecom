// src/api/session.js
// The signed-in customer's tokens and how they are renewed.
//
// The backend's access token lives minutes (JWT_ACCESS_MINUTES, 15) and its refresh token is single-use: every refresh
// hands out a new refresh token and blacklists the old one. Two consequences drive everything here:
//   - a renewal must happen ONCE however many requests found the access token expired (the homepage alone sends five
//     at the same moment), or the second one arrives with an already blacklisted token and signs a valid customer out;
//   - only the server saying "this refresh token is no good" may end a session, never a dropped connection or a 5xx.
import axios from 'axios';
import Cookies from 'js-cookie';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
// The backend's refresh token lives 30 days (JWT_REFRESH_DAYS) and each refresh issues a new one, so the browser keeps
// the cookie that long as well. Without an expiry it is a session cookie that disappears when the browser closes.
const COOKIE_DAYS = 30;

const cookieOptions = () => ({
  expires: COOKIE_DAYS,
  secure: window.location.protocol === 'https:', // a Secure cookie is only sent over HTTPS (plain http in local dev)
  sameSite: 'Strict', // prevents CSRF
});

export const readTokens = () => ({
  access: Cookies.get(ACCESS_COOKIE) || null,
  refresh: Cookies.get(REFRESH_COOKIE) || null,
});

export const saveTokens = ({ access, refresh }) => {
  if (access) Cookies.set(ACCESS_COOKIE, access, cookieOptions());
  if (refresh) Cookies.set(REFRESH_COOKIE, refresh, cookieOptions());
};

export const clearTokens = () => {
  Cookies.remove(ACCESS_COOKIE);
  Cookies.remove(REFRESH_COOKIE);
};

// Why a renewal gave no new token. `expired`: the session is over (the server refused the refresh token, or there is none),
// the customer has to sign in again. Otherwise (no connection, a 5xx, too many requests) nothing is known about the
// session: it stays, only this attempt failed.
export class SessionError extends Error {
  constructor(expired, cause) {
    super(expired ? 'Session expired' : 'Could not renew the session');
    this.name = 'SessionError';
    this.expired = expired;
    this.cause = cause;
  }
}

const requestNewTokens = async () => {
  const { refresh } = readTokens();
  if (!refresh) throw new SessionError(true);

  let response;
  try {
    response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}accounts/token/refresh/`,
      { refresh },
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    // 401: invalid, expired or blacklisted refresh token (backend contract). Anything else proves nothing.
    throw new SessionError(error?.response?.status === 401, error);
  }

  const tokens = response?.data?.data;
  if (!tokens?.access) throw new SessionError(false, new Error('The refresh answer had no access token.'));

  saveTokens(tokens);
  // Loaded here, not at the top: the store imports the slices that import this file.
  const [{ default: store }, { sessionRefreshed }] = await Promise.all([
    import('../redux/store'),
    import('../redux/slice/authSlice'),
  ]);
  store.dispatch(sessionRefreshed(tokens));
  return tokens.access;
};

let inFlight = null;

// A new access token. Everyone asking while a renewal is under way gets that same renewal's answer.
export const refreshSession = () => {
  if (!inFlight) {
    inFlight = requestNewTokens().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
};
