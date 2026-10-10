import { useEffect, useState } from 'react';

// A read the shop answers the same way for everyone and that rarely changes (its delivery charges, its suggested coupons): asked once per visit
// and kept outside React, so browsing from product to product does not ask again. A failed or empty answer is not kept, the next page asks again.
//   load  () => Promise<value | null>   (never rejects; null = nothing to show)
// Returns [useValue, forget]: `useValue()` is [value, loading] (value null until it arrives, and when there is none); `forget()` is for tests.
export const sessionRead = (load) => {
  let cached = null;
  let pending = null;

  const ask = () => {
    if (!pending) {
      pending = load()
        .then((value) => { cached = value ?? null; return cached; })
        .catch(() => null)
        .finally(() => { pending = null; });
    }
    return pending;
  };

  const useValue = () => {
    const [state, setState] = useState({ value: cached, loading: !cached });
    useEffect(() => {
      if (cached) return undefined;
      let alive = true;
      ask().then((value) => { if (alive) setState({ value, loading: false }); });
      return () => { alive = false; };
    }, []);
    return [state.value, state.loading];
  };

  const forget = () => { cached = null; pending = null; };
  return [useValue, forget];
};
