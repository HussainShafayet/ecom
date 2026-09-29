import { useCallback, useEffect, useState } from 'react';

// Seconds counting down to 0, a second at a time. `start(n)` (re)starts it from n; `initial` seconds are already counting when the
// component first draws (a code that was just sent has a wait before another can be asked for).
const useCountdown = (initial = 0) => {
  const [seconds, setSeconds] = useState(initial);

  useEffect(() => {
    if (seconds <= 0) return undefined;
    const timer = setTimeout(() => setSeconds((left) => left - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const start = useCallback((from) => setSeconds(Math.max(0, Math.ceil(from))), []);
  return [seconds, start];
};

export default useCountdown;
