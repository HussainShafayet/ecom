import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectSite } from '../../redux/slice/siteSlice';

// The bar above the header. The admin turns it on and writes the text (and, if they like, where it leads: a page of
// the shop or another website) in Site settings; without it nothing is drawn.
const AnnouncementBar = () => {
  const { announcement } = useSelector(selectSite);
  if (!announcement?.text) return null;

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
