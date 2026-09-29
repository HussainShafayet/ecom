import React from 'react';
import { useSelector } from 'react-redux';
import { FaLock, FaShieldAlt } from 'react-icons/fa';

const STEPS = ['Your phone', 'Your code'];

// The frame of the sign-in, sign-up and code pages. Phone first, and the shop's own, not a stock white box: a band in the
// site's blue-to-purple with the SHOP's logo, name and tagline (from the site settings), two steps ("Your phone", "Your code")
// so the customer knows there are two, the card overlapping the band with an icon badge on its edge, and two lines of
// reassurance under it (no password to remember, the number is private). The form is the first thing under the band. Everything
// is drawn with CSS: no picture to download from another website.
//   icon   a react-icons component for the badge; step  1 or 2, which of the two steps this page is
const AuthLayout = ({ title, subtitle, icon: Icon, step = 1, children, footer }) => {
  const site = useSelector((state) => state.site?.site);
  const name = site?.name || '';

  return (
    <div className="mx-auto w-full max-w-md pb-6">
      <div className="relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 px-5 pb-20 pt-5 text-white sm:rounded-3xl">
        {/* decoration only */}
        <span aria-hidden="true" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <span aria-hidden="true" className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/10" />
        <span aria-hidden="true" className="absolute bottom-6 right-6 h-16 w-16 opacity-30 [background-image:radial-gradient(currentColor_1.5px,transparent_1.5px)] [background-size:10px_10px]" />

        <div className="relative flex items-center gap-3">
          <img
            src={site?.logo || '/static image/gocart-logo.svg'}
            alt={name ? `${name} logo` : 'Shop logo'}
            className="h-11 w-11 shrink-0 rounded-full bg-white object-contain p-1.5 shadow"
          />
          <div className="min-w-0">
            <p className="truncate text-lg font-bold leading-tight">{name || 'Welcome'}</p>
            {site?.tagline && <p className="truncate text-xs text-indigo-100">{site.tagline}</p>}
          </div>
        </div>

        <ol aria-label="Steps" className="relative mt-5 flex items-center text-xs font-medium">
          {STEPS.map((label, index) => {
            const number = index + 1;
            const current = number === step;
            const done = number < step;
            return (
              <li key={label} aria-current={current ? 'step' : undefined} className={`flex items-center gap-2 ${index < STEPS.length - 1 ? 'flex-1' : ''} ${current ? 'text-white' : 'text-indigo-100'}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${current ? 'bg-white text-indigo-700' : done ? 'bg-white/30 text-white' : 'border border-white/50'}`}>
                  {done ? '✓' : number}
                </span>
                <span className="shrink-0">{label}</span>
                {index < STEPS.length - 1 && <span aria-hidden="true" className="mx-1 h-px flex-1 bg-white/40" />}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="relative -mt-12 px-4">
        <div className="relative rounded-2xl border border-gray-100 bg-white px-5 pb-6 pt-11 text-center shadow-xl sm:px-8 sm:pb-8">
          {Icon && (
            <span aria-hidden="true" className="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-white text-2xl text-indigo-600 shadow-lg ring-4 ring-indigo-100">
              <Icon />
            </span>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
          <div className="mt-5 text-left">{children}</div>
        </div>

        <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-gray-500">
          <li className="flex items-center gap-1.5"><FaLock aria-hidden="true" /> No password to remember</li>
          <li className="flex items-center gap-1.5"><FaShieldAlt aria-hidden="true" /> We never share your number</li>
        </ul>
        {footer && <p className="mt-3 text-center text-sm text-gray-600">{footer}</p>}
      </div>
    </div>
  );
};

export default AuthLayout;
