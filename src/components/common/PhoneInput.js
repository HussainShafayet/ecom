import React from 'react';
import { normalizePhone, PHONE_PREFIX } from '../../utils/phone';

// The phone box of every form (sign in, sign up, checkout): a fixed +880 in front and a box for the 10 digits after it. It
// hands `onChange` the DIGITS, already cleaned (`01712345678`, `8801712345678` and a pasted "+880 1712-345678" all arrive as
// `1712345678`), and asks a phone for its number keypad and its saved number (`tel-national`). Put it inside a `Field` with
// the same `id`.
const PhoneInput = ({ id, name = 'phone_number', value, onChange, onBlur, error, enterKeyHint = 'next' }) => (
  <div className={`flex overflow-hidden rounded-lg border bg-white focus-within:ring-2 focus-within:ring-blue-400 ${error ? 'border-red-500' : 'border-gray-300'}`}>
    <span className="flex items-center border-r border-gray-300 bg-gray-50 px-3 text-base text-gray-700">{PHONE_PREFIX}</span>
    <input
      id={id}
      name={name}
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      enterKeyHint={enterKeyHint}
      placeholder="1712345678"
      value={value}
      onChange={(event) => onChange(normalizePhone(event.target.value))}
      onBlur={onBlur}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      className="h-12 min-w-0 flex-1 border-none bg-transparent px-3 text-base text-gray-900 focus:outline-none"
    />
  </div>
);

export default PhoneInput;
