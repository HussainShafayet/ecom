import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../redux/slice/pageTitleSlice';

// Names the page in the browser tab: `usePageTitle('Cart')` -> "Cart | GoCart". Anything empty (a product that has not arrived yet) leaves
// the shop's own title, and the title is taken back when the page goes, so the next page without one does not inherit this page's name.
const usePageTitle = (title) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle(title || ''));
    return () => {
      dispatch(setPageTitle(''));
    };
  }, [dispatch, title]);
};

export default usePageTitle;
