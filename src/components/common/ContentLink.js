import React from 'react';
import { Link } from 'react-router-dom';

// Where a slide, banner or video of the CMS (`apps/content`) leads. The admin picks a product, a category or another
// website (`type`: product | category | external; `link` is the slug, `external_link` the address).
export const resolveContentLink = (item) => {
  if (!item) return null;
  if (item.type === 'product' && item.link) return { to: `/products/detail/${item.link}` };
  if (item.type === 'category' && item.link) return { to: `/products/?category=${item.link}` };
  // http(s) only: the backend refuses anything else, and a `javascript:` address must never become a link here either
  if (item.external_link && /^https?:\/\//i.test(item.external_link)) return { href: item.external_link };
  return null;
};

// A link to a page of the shop stays in this tab (a single-page app); another website opens in a new one. An item that
// leads nowhere is drawn without a link, not as a broken one.
const ContentLink = ({ item, className, children, ...rest }) => {
  const target = resolveContentLink(item);

  if (!target) return <div className={className} {...rest}>{children}</div>;
  if (target.to) return <Link to={target.to} className={className} {...rest}>{children}</Link>;
  return <a href={target.href} target="_blank" rel="noopener noreferrer" className={className} {...rest}>{children}</a>;
};

export default ContentLink;
