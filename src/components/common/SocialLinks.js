import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin, FaTiktok, FaWhatsapp, FaTelegram } from 'react-icons/fa';

const PLATFORMS = {
  facebook: { label: 'Facebook', Icon: FaFacebook },
  instagram: { label: 'Instagram', Icon: FaInstagram },
  x: { label: 'X (Twitter)', Icon: FaTwitter },
  youtube: { label: 'YouTube', Icon: FaYoutube },
  linkedin: { label: 'LinkedIn', Icon: FaLinkedin },
  tiktok: { label: 'TikTok', Icon: FaTiktok },
  whatsapp: { label: 'WhatsApp', Icon: FaWhatsapp },
  telegram: { label: 'Telegram', Icon: FaTelegram },
};

// One icon link per social account the admin listed (`links` = site.social_links: [{ platform, url }]).
const SocialLinks = ({ links = [], size = 20, className = '', linkClassName = '' }) => {
  const shown = links.filter((link) => PLATFORMS[link.platform] && /^https?:\/\//i.test(link.url));
  if (shown.length === 0) return null;

  return (
    <div className={`flex gap-4 ${className}`}>
      {shown.map(({ platform, url }) => {
        const { label, Icon } = PLATFORMS[platform];
        return (
          <a key={platform} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className={linkClassName}>
            <Icon size={size} />
          </a>
        );
      })}
    </div>
  );
};

export default SocialLinks;
