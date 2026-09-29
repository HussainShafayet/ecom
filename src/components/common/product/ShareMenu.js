import React, { useCallback, useRef, useState } from 'react';
import { FaCheck, FaCopy, FaFacebook, FaShareAlt, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import useOutsideClick from '../../../hooks/useOutsideClick';

const ITEM = 'flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-800 hover:bg-gray-100';

// Sharing a product. Where the browser has a share sheet (a phone) the button opens it (WhatsApp, Messenger, ... whatever
// the customer has installed); elsewhere it is a small menu: copy the link, Facebook, X, WhatsApp. Copying says "Link copied".
const ShareMenu = ({ name }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useOutsideClick(ref, close);

  const url = window.location.href;
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const share = async () => {
    if (!canShare) {
      setOpen((value) => !value);
      return;
    }
    try {
      await navigator.share({ title: name, url });
    } catch {
      // the customer closed the sheet: nothing to say
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // No clipboard API (a page opened over plain http): the old way
      const box = document.createElement('textarea');
      box.value = url;
      box.style.position = 'fixed';
      document.body.appendChild(box);
      box.select();
      try { document.execCommand('copy'); } catch { /* nothing more to try */ }
      document.body.removeChild(box);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button type="button" onClick={share} aria-expanded={canShare ? undefined : open} className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 px-3 text-sm font-medium text-gray-700">
        {copied ? <FaCheck aria-hidden="true" className="text-green-600" /> : <FaShareAlt aria-hidden="true" />}
        {copied ? 'Link copied' : 'Share'}
      </button>
      {open && (
        <ul className="absolute bottom-full left-0 z-20 mb-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg md:bottom-auto md:top-full md:mb-0 md:mt-2">
          <li><button type="button" onClick={copy} className={ITEM}><FaCopy aria-hidden="true" className="text-gray-500" />Copy link</button></li>
          <li>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className={ITEM}>
              <FaFacebook aria-hidden="true" className="text-blue-700" />Facebook
            </a>
          </li>
          <li>
            <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(name || '')}`} target="_blank" rel="noopener noreferrer" className={ITEM}>
              <FaTwitter aria-hidden="true" className="text-sky-500" />X (Twitter)
            </a>
          </li>
          <li>
            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${name || 'Check this out'} ${url}`)}`} target="_blank" rel="noopener noreferrer" className={ITEM}>
              <FaWhatsapp aria-hidden="true" className="text-green-500" />WhatsApp
            </a>
          </li>
        </ul>
      )}
    </div>
  );
};

export default ShareMenu;
