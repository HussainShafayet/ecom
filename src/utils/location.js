// Bangladesh's places as the shop's own lists know them (src/data/location.js), looked up by NAME (an address stores names, not ids).
// A name the lists do not know gives an empty list, never an error.
import { districtsData, divisionsData, upazilasData } from '../data/location';

export const districtsOf = (divisionName) => {
  const division = divisionsData.find((item) => item.name === divisionName);
  return division ? districtsData.filter((item) => item.division_id === division.id) : [];
};

export const upazilasOf = (divisionName, districtName) => {
  const district = districtsOf(divisionName).find((item) => item.name === districtName);
  return district ? upazilasData.filter((item) => item.district_id === district.id) : [];
};
