// src/services/siteService.js
// The shop's own identity and pages, written by the admin (backend docs/API_CONTRACT.md section 9). All public.

// { site: { name, tagline, logo, announcement, contact, social_links, trust_badges, footer_pages } }
export const getSite = async () => {
  const publicApi = (await import('../api/publicApi')).default;
  return await publicApi.get('/site/', { section: "site"});
};

// One page the admin wrote: { page: { slug, title, body (cleaned HTML), updated_at } }; 404 when there is none
export const getSitePage = async (slug) => {
  const publicApi = (await import('../api/publicApi')).default;
  return await publicApi.get(`/site/pages/${slug}/`, { section: "site-page"});
};

// { faqs: [{ category, question, answer }] }
export const getFaqs = async () => {
  const publicApi = (await import('../api/publicApi')).default;
  return await publicApi.get('/site/faq/', { section: "faq"});
};

// A visitor writes to the shop: { name, email, message } + optional { phone, subject }; 201, 400 with sentences, 429
export const sendContactMessage = async (message) => {
  const publicApi = (await import('../api/publicApi')).default;
  return await publicApi.post('/site/contact/', message, { section: "contact"});
};

// The newsletter box: always 200 with the same sentence, whether the address was new or not
export const subscribeToNewsletter = async (email) => {
  const publicApi = (await import('../api/publicApi')).default;
  return await publicApi.post('/site/newsletter/', { email }, { section: "newsletter"});
};
