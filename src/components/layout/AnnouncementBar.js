import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectSite } from '../../redux/slice/siteSlice';
import useHasPassed from '../../hooks/useHasPassed';

// The bar above the header. The admin turns it on and writes the text (and, if they like, where it leads: a page of
// the shop or another website) in Site settings; without it nothing is drawn. If the admin also set an end, the bar goes by itself
// when it comes, even in a tab that has been open since before (the site is read once when the storefront opens).
const AnnouncementBar = () => {
  const { announcement } = useSelector(selectSite);
  const over = useHasPassed(announcement?.endsAt ?? null);
  if (!announcement?.text || over) return null;

  const { text, link } = announcement;
  let content = text;
  if (link && link.startsWith('/') && !link.startsWith('//')) {
    content = <Link to={link}>{text}</Link>;
  } else if (link && /^https?:\/\//i.test(link)) {
    content = <a href={link} target="_blank" rel="noopener noreferrer">{text}</a>;
  }

  return (
    <div className="bg-blue-600 text-white text-center py-2 text-sm" role="region" aria-label="Announcement">
      {content}
    </div>
  );
};

export default AnnouncementBar;
