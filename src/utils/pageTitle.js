// What the browser tab (and a bookmark, and the history list) says. The shop's own title is its name with its tagline ("GoCart | Everyday
// things"); a page puts its own name in front of the shop's ("Red Mug | GoCart"), so several tabs of the same shop can be told apart.

// The shop's title: name | tagline, just the name without a tagline, '' until the shop's details have arrived
export const siteTitle = ({ name, tagline } = {}) => {
  if (!name) return '';
  return tagline ? `${name} | ${tagline}` : name;
};

// The title of a tab: the page's name, then the shop's; the shop's own title on a page with no name of its own; '' (leave the tab as it is)
// when there is nothing to say yet
export const documentTitle = ({ page, name, tagline } = {}) => {
  const own = typeof page === 'string' ? page.trim() : '';
  if (!own) return siteTitle({ name, tagline });
  return name ? `${own} | ${name}` : own;
};
