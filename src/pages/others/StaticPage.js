import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader, RichTextToHTML } from '../../components/common';
import { getSitePage } from '../../services/siteService';
import usePageTitle from '../../hooks/usePageTitle';

// What the admin's HTML looks like: headings, paragraphs, lists, links, images and tables, styled here because the
// backend sends bare tags (it has already removed scripts and styles).
const BODY_STYLE = [
  'text-gray-700 leading-relaxed',
  '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2',
  '[&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_li]:mb-1',
  '[&_a]:text-blue-600 [&_a]:underline [&_img]:max-w-full [&_img]:rounded-lg [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:text-gray-600',
  '[&_table]:w-full [&_table]:mb-3 [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_th]:bg-gray-50',
].join(' ');

// A page the admin wrote (About us, Privacy policy, Terms, ...). The slug comes from /pages/:slug.
const StaticPage = ({ slug: fixedSlug }) => {
  const params = useParams();
  const slug = fixedSlug || params.slug;
  const [state, setState] = useState({ status: 'loading', page: null }); // loading | ready | missing | failed
  usePageTitle(state.status === 'ready' ? state.page?.title : state.status === 'missing' ? 'Page not found' : '');

  useEffect(() => {
    let current = true;
    setState({ status: 'loading', page: null });
    getSitePage(slug)
      .then((response) => {
        if (current) setState({ status: 'ready', page: response?.data?.data?.page });
      })
      .catch((error) => {
        if (current) setState({ status: error?.response?.status === 404 ? 'missing' : 'failed', page: null });
      });
    return () => { current = false; };
  }, [slug]);

  if (state.status === 'loading') {
    return <div className="py-16"><Loader message="Loading page" /></div>;
  }

  if (state.status !== 'ready' || !state.page) {
    return (
      <div className="container mx-auto my-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-2">
          {state.status === 'missing' ? 'This page does not exist' : 'This page could not be loaded'}
        </h1>
        <p className="text-gray-600 mb-6">
          {state.status === 'missing' ? 'It may have been moved or taken offline.' : 'Please try again in a moment.'}
        </p>
        <Link to="/" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Go Back Home</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto my-10 px-4 md:px-8 lg:px-16 max-w-4xl">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">{state.page.title}</h1>
      <div className={BODY_STYLE}>
        <RichTextToHTML content={state.page.body} />
      </div>
    </div>
  );
};

export default StaticPage;
