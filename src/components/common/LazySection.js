import React, { useRef } from 'react';
import useInView from '../../hooks/useInView';
import { SectionSkeleton } from './skeleton';

// A part of a long page that is only mounted, and so only asks the backend for its data, when the customer is about to reach
// it (400 px ahead by default, so it is usually there before they are). Until then a placeholder of the right kind keeps its
// place (`placeholder` is another one, for a part that may turn out to draw nothing: a spacer, not a fake product grid).
// The homepage has eight sections that each fetch on mount; on a phone the ones far below the fold are not worth
// the mobile data and the server time of an opening that may never scroll that far.
const LazySection = ({ children, rootMargin = '400px', placeholder = <SectionSkeleton /> }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { rootMargin });

  return <div ref={ref}>{inView ? children : placeholder}</div>;
};

export default LazySection;
