import { useEffect, useState } from 'react';

// How long until `target` (a moment, in milliseconds since 1970, or null for none): `{left, days, hours, minutes, seconds, over}` with
// `left` in whole seconds (rounded up, so it never reads 0 while a moment is left), or null without a target. It works out the time
// left from the clock at every tick instead of counting ticks, so a tab that slept (a phone with the screen off) is right again
// the moment it wakes, which a counter that subtracts one a second is not. Ticks fall on the second.
const useCountdownTo = (target) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (target == null) return undefined;
    let timer;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (current < target) timer = setTimeout(tick, 1000 - (current % 1000));
    };
    tick();
    const wake = () => { if (document.visibilityState === 'visible') tick(); };
    document.addEventListener('visibilitychange', wake);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', wake);
    };
  }, [target]);

  if (target == null) return null;
  const left = Math.max(0, Math.ceil((target - now) / 1000));
  return {
    left,
    days: Math.floor(left / 86400),
    hours: Math.floor((left % 86400) / 3600),
    minutes: Math.floor((left % 3600) / 60),
    seconds: left % 60,
    over: left === 0,
  };
};

export default useCountdownTo;
