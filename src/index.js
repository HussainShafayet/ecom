import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import './index.css';
import App from './App';
import './tailwind.css';
import {Provider} from 'react-redux';
import store, {persistor} from './redux/store';
import {PersistGate} from 'redux-persist/integration/react';

// Off unless VITE_SENTRY_DSN is set (local dev, tests, CI stay silent). Reports uncaught render errors
// (via the ErrorBoundary below) and anything sent with Sentry.captureException, e.g. the axios interceptors.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0,
  });
}

function ErrorFallback() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      backgroundColor: '#f8d7da', color: '#721c24', textAlign: 'center', padding: '20px'
    }}>
      <div>
        <h2>⚠️ Something went wrong</h2>
        <p>Please reload the page. If this keeps happening, contact support.</p>
        <button onClick={() => window.location.reload()} style={{
          backgroundColor: '#721c24', color: 'white', border: 'none',
          padding: '10px 20px', cursor: 'pointer', marginTop: '10px'
        }}>
          Reload
        </button>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
      </Provider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

