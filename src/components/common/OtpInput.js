import React, { useState } from 'react';

// The code from the SMS, drawn as one box per digit (six squares that fill in as you type) over ONE real input. The input is what
// the phone talks to: its number keypad, "fill in from SMS" (`one-time-code`), paste, backspace, a screen reader reading the
// digits; it lies over the boxes, invisible, so a tap anywhere on them focuses it. The boxes are only the picture (aria-hidden),
// the next empty one lit while the input is focused. Put it inside a `Field` with the same `id`; `onChange` gets the digits.
const OtpInput = ({ id, name = 'otp', value, onChange, error, length = 6 }) => {
  const [focused, setFocused] = useState(false);
  const next = Math.min(value.length, length - 1);

  return (
    <div className="relative">
      <div aria-hidden="true" className="flex gap-2">
        {Array.from({ length }, (_, index) => {
          const digit = value[index];
          let look = 'border-gray-300 bg-white';
          if (error) look = 'border-red-400 bg-red-50';
          else if (focused && index === next) look = 'border-indigo-600 ring-2 ring-indigo-200 bg-white';
          else if (digit) look = 'border-indigo-300 bg-indigo-50';
          return (
            <div key={index} className={`flex h-14 min-w-0 flex-1 items-center justify-center rounded-lg border-2 text-2xl font-bold text-gray-900 ${look}`}>
              {digit || ''}
            </div>
          );
        })}
      </div>
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        enterKeyHint="go"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, length))} // digits only, however typed or pasted
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
      />
    </div>
  );
};

export default OtpInput;
