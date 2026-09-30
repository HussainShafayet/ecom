import { useEffect, useRef } from 'react';

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

// Makes a modal dialog behave like one: focus goes into it and comes back to what had it, Tab stays inside, Esc closes it, and the
// page behind does not scroll (the storefront scrolls in one container, `scrollRef`, not in the body). `dialogRef` is the element
// with `role="dialog"` and `tabIndex={-1}`.
const useDialog = (dialogRef, onClose, scrollRef) => {
  const close = useRef(onClose);
  close.current = onClose; // the latest one, without re-running the effect when a parent re-renders

  useEffect(() => {
    const before = document.activeElement;
    const scroller = scrollRef?.current;
    const overflow = scroller?.style.overflow;
    if (scroller) scroller.style.overflow = 'hidden';
    dialogRef.current?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape') {
        close.current();
      } else if (event.key === 'Tab' && dialogRef.current) {
        const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (!dialogRef.current.contains(document.activeElement)) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      if (scroller) scroller.style.overflow = overflow || '';
      if (before && typeof before.focus === 'function') before.focus();
    };
  }, [dialogRef, scrollRef]);
};

export default useDialog;
