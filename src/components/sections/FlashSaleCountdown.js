import React, { useEffect } from 'react';
import { FaBolt } from 'react-icons/fa';
import useCountdownTo from '../../hooks/useCountdownTo';
import { formatCountdown, spokenTime } from '../../utils/flashSale';

// "⚡ Ends in 02:14:09" (the red-to-orange pill the sale is recognised by). `endsAt` is a moment on this device's clock
// (`utils/flashSale.anchorFlashSale`); `label` says what it counts to ("Ends in", "Starts in"). The digits do not jump about
// (`tabular-nums`), a screen reader is told "Flash sale ends in 2 hours 14 minutes" (a `timer`, which is not announced at every tick)
// instead of reading the seconds out, and when it reaches zero `onEnd` is called once so the page can ask the shop what is true now.
const FlashSaleCountdown = ({ endsAt, label = 'Ends in', onEnd }) => {
  const time = useCountdownTo(endsAt);
  const over = Boolean(time?.over);

  useEffect(() => {
    if (over) onEnd?.();
  }, [over, onEnd, endsAt]);

  if (!time) return null;
  return (
    <span
      role="timer"
      aria-label={`Flash sale ${label.toLowerCase()} ${over ? 'a moment' : spokenTime(time)}`}
      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-orange-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm"
    >
      <FaBolt aria-hidden="true" className="text-yellow-200" />
      <span aria-hidden="true">{label}</span>
      <span aria-hidden="true" className="min-w-[4.5rem] text-center font-bold tabular-nums">{formatCountdown(time)}</span>
    </span>
  );
};

export default FlashSaleCountdown;
