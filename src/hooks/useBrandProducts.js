import { useEffect, useState } from 'react';
import { getBrandProducts } from '../services/productService';

// The products of a brand, for "More from <brand>": asked once per brand per visit and kept outside React (a shopper looking at three
// products of one brand asks once). `null` while it is on its way, and when it failed or the brand has nothing (nothing to draw either way).
const cache = new Map();
export const forgetBrandProducts = () => cache.clear(); // for tests

const useBrandProducts = (brand) => {
  const [products, setProducts] = useState(() => (brand ? cache.get(brand) || null : null));

  useEffect(() => {
    if (!brand) { setProducts(null); return undefined; }
    if (cache.has(brand)) { setProducts(cache.get(brand)); return undefined; }
    setProducts(null);
    let alive = true;
    getBrandProducts(brand)
      .then((response) => {
        const results = response?.data?.data?.results;
        const list = Array.isArray(results) ? results : [];
        cache.set(brand, list);
        if (alive) setProducts(list);
      })
      .catch(() => {}); // only a hint: not kept, the next product of this brand asks again
    return () => { alive = false; };
  }, [brand]);

  return products;
};

export default useBrandProducts;
