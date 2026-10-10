import { getDeliveryInfo } from '../services/contentService';
import { sessionRead } from './sessionRead';

// { charges: { inside_dhaka: 60, outside_dhaka: 120 }, estimates: { inside_dhaka: { min_days, max_days } } } or null
const [useDeliveryInfo, forgetDeliveryInfo] = sessionRead(async () => {
  const data = (await getDeliveryInfo())?.data?.data;
  return data?.delivery_charges ? { charges: data.delivery_charges, estimates: data.delivery_estimates || {} } : null;
});

export { forgetDeliveryInfo };
export default useDeliveryInfo;
