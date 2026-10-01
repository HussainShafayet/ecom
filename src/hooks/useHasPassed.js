import { useEffect, useState } from 'react';

// A setTimeout longer than this (about 24.8 days) fires at once instead of later
const LONGEST_WAIT = 2 ** 31 - 1;

// Whether `moment` (milliseconds since 1970, or null for never) has passed on this device's clock. It renders again only when the
// answer changes, once, where `useCountdownTo` renders every second to draw a number nobody is asking for here. It reads the clock
// each time it wakes instead of trusting how long it slept, so a tab that was asleep (a phone with the screen off) is right again the
// moment it wakes, and a moment further away than a timer can wait is waited for in steps.
const useHasPassed = (moment) => {
  const [passed, setPassed] = useState(() => moment != null && Date.now() >= moment);

  useEffect(() => {
    if (moment == null) {
      setPassed(false);
      return undefined;
    }
    let timer;
    const check = () => {
      clearTimeout(timer);
      const left = moment - Date.now();
      if (left <= 0) {
        setPassed(true);
        return;
      }
      setPassed(false);
      timer = setTimeout(check, Math.min(left, LONGEST_WAIT));
    };
    check();
    const wake = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', wake);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', wake);
    };
  }, [moment]);

  return passed;
};

export default useHasPassed;
