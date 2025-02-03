import {useState} from "react";
import {FaEdit, FaTrash} from "react-icons/fa";
import {dhakaCityData, districtsData, divisionsData, upazilasData} from "../../data/location";
import {useDispatch} from "react-redux";
import {handleAddressCreate, handleAddressDelete, handleAddressUpdate} from "../../redux/slice/profileSlice";

const AddressItem = ({ address, onUpdate }) => {
    const dispatch = useDispatch();
    const [isEditing, setIsEditing] = useState(false);
    const [editedAddress, setEditedAddress] = useState(address);
    const [touched, updateTouched] = useState({});
    const [errors, setErrors] = useState({});
   
    const [districts, setDistricts] = useState([]);
    const [upazillas, setUpazillas] = useState([]);
    const [confirmDelete, setConfirmDelete] = useState(null);

    // Toggle edit mode
    const handleEditClick = () => {
      setIsEditing(!isEditing);

      setDistricts(address.division && getDistricts(address.division) || [])
      setUpazillas(address.district && getUpazillas(address.district) || [])
    };
    const getDistricts = (division) =>{
        const divisionItem = divisionsData.find((item)=> item.name === division);
        const divisionDist = districtsData.filter((item)=> item.division_id === divisionItem.id);
        return divisionDist;
    }
    const getUpazillas = (district) =>{
        
        const districtItem = districtsData.find((item)=> item.name === district);
        
        const upazillaDist = upazilasData.filter((item)=> item.district_id === districtItem.id);
        
        return upazillaDist;;
    }

    
  
    // Handle input changes
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setEditedAddress((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
     const handleBlur = (e) => {
        const { name } = e.target;
        updateTouched({ [name]: true });
    
        // Validate field on blur to show error if empty
        if (!editedAddress[name]?.trim()) {
          setErrors({ ...errors, [name]: `${name} is required` });
        }
      };
    const handleLocationType= (e) =>{
        const locationType = e.target.value;
        
        locationType && 
        setEditedAddress((prevState) => ({
            ...prevState,
            ['shipping_type']: locationType,
            ['area']: '',
          }));
        
         // Validate field on change and clear error if valid
         if (locationType?.trim()) {
          setErrors({ ...errors, ['shipping_type']: '' });
        }
    
        //isAuthenticated && dispatch(setSelectedAddressId(null));
      }
      const handleDhakaArea = (e) => {
        const area = e.target.value;
        setEditedAddress((prev) => ({
            ...prev,
            area: area,
            division: '',
            district: '',
            thana: '',
          }));
        
        // Validate field on change and clear error if valid
        if (area.trim()) {
        setErrors({ ...errors, ['area']: '' });
        }
        //isAuthenticated && dispatch(setSelectedAddressId(null));
    }
    const handleDivisionChange = (e) => {
        const division = e.target.value;
        const divisionItem = divisionsData.find((item)=> item.name === division);
        if (divisionItem) {
            setEditedAddress((prev) => ({
                ...prev,
                division: division,
                district: '',
                thana: '',
              }));
            const divisionDist = districtsData.filter((item)=> item.division_id === divisionItem.id);
            
            setDistricts(divisionDist|| []);
            setUpazillas([]);
        }
        

        // Validate field on change and clear error if valid
        if (division.trim()) {
            setErrors({ ...errors, ['division']: '' });
        }
    };

     const handleDistrictChange = (e) => {
        const district = e.target.value;
        const districtItem = districts.find((item)=> item.name === district);
        if (districtItem) {
            setEditedAddress((prev) => ({
                ...prev,
                district: district,
                thana: '',
              }));
    
          const upzillaDist = upazilasData.filter((item)=> item.district_id === districtItem.id);
          
          setUpazillas(upzillaDist|| []);
        }
         // Validate field on change and clear error if valid
         if (district.trim()) {
          setErrors({ ...errors, ['district']: '' });
        }
      };
  
    // Handle form submission
    const handleSubmit = (e) => {
      e.preventDefault();
      console.log(editedAddress);
     
      dispatch(handleAddressUpdate(editedAddress));
    //  onUpdate(editedAddress); // Pass updated address to parent
      setIsEditing(false); // Exit edit mode
    };

    const handleDelete = () => {
      dispatch(handleAddressDelete(address.id));
    };
  
    // Helper function to render a field with a fallback message if the data is missing
    const renderField = (label, value, fallback = "Not provided") => {
      return (
        <p className="text-gray-600">
          <span className="font-medium">{label}:</span> {value || fallback}
        </p>
      );
    };
  
    return (
      <div className="bg-white shadow-md rounded-lg p-3 mb-4 max-w-md mx-auto relative">
        {/* Edit and Delete Icons */}
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
              onClick={handleEditClick}
              className="text-gray-500 hover:text-blue-500"
          >
              <FaEdit className="w-5 h-5" />
          </button>
          <button
              onClick={()=>setConfirmDelete(address.id)}
              className="text-gray-500 hover:text-red-500"
          >
              <FaTrash className="w-5 h-5" />
          </button>
        </div>
  
        {isEditing ? (
          // Edit Form
          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                value={editedAddress.title || ''}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={editedAddress.address || ''}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
            <select
                name="shipping_type"
                value={editedAddress.shipping_type || ''}
                onChange={handleLocationType}
                onBlur={handleBlur}
                required
                className="border border-gray-300 p-2 rounded-lg w-full"
            >
                <option value="">Select Shipping Area</option>
                <option value="inside_dhaka">In Dhaka City</option>
                <option value="outside_dhaka">Out of Dhaka City</option>
            </select>
            {touched.shipping_type && errors.shipping_type && <p className="text-red-500 text-xs mt-1">{errors.shipping_type}</p>}
            </div>
            {editedAddress.shipping_type === 'inside_dhaka' && (
                <div className="grid grid-cols-1 gap-3">
                <div className="w-full">
                    <select
                    name="shipping_area"
                    value={editedAddress.area || ''}
                    onChange={handleDhakaArea}
                    onBlur={handleBlur}
                    required
                    className={`border ${touched.area && errors.area ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                    >
                    <option value="">Select Area in</option>
                    {dhakaCityData.map((area) => (
                        <option key={area.id} value={area.name}>{area.name}</option>
                    ))}
                    </select>
                    {touched.area && errors.area && <p className="text-red-500 text-xs mt-1">{errors.area}</p>}
                </div>
                </div>
            )}
             {editedAddress.shipping_type === 'outside_dhaka' && (
                <>
                <div>
                    <select
                    name="division"
                    value={editedAddress.division || ''}
                    onChange={handleDivisionChange}
                    onBlur={handleBlur}
                    required
                    className={`border ${touched.division && errors.division ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                    >
                    <option value="">Select Division</option>
                    {divisionsData.map((division) => (
                        <option key={division.id} value={division.name}>{division.name}</option>
                    ))}
                    </select>
                    {touched.division && errors.division && <p className="text-red-500 text-xs mt-1">{errors.division}</p>}
                </div>

               <div>
                    <select
                    name="district"
                    value={editedAddress.district || ''}
                    onChange={handleDistrictChange}
                    onBlur={handleBlur}
                    required
                    className={`border ${touched.district && errors.district ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                    disabled={!editedAddress.division}
                    >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                        <option key={district.id} value={district.name}>{district.name}</option>
                    ))}
                    </select>
                    {touched.district && errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                </div>

                <div>
                    <select
                    name="thana"
                    value={editedAddress.thana || ''}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    required
                    className={`border ${touched.thana && errors.thana ? 'border-red-500' : 'border-gray-300'} p-2 rounded-lg w-full`}
                    disabled={!editedAddress.district}
                    >
                    <option value="">Select Upazila/Thana</option>
                    {upazillas.map((station) => (
                        <option key={station.id} value={station.name}>{station.name}</option>
                    ))}
                    </select>
                    {touched.thana && errors.thana && <p className="text-red-500 text-xs mt-1">{errors.thana}</p>}
                </div>
                </>
            )}
            {/*<div>
              <label className="block text-sm font-medium text-gray-700">Division</label>
              <input
                type="text"
                name="division"
                value={editedAddress.division || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">District</label>
              <input
                type="text"
                name="district"
                value={editedAddress.district || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Thana</label>
              <input
                type="text"
                name="thana"
                value={editedAddress.thana || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>*/}
           
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handleEditClick}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          // Display Address Details
          <div className="space-y-2">
            {address.title && (
              <h2 className="text-xl font-semibold text-gray-800">{address.title}</h2>
            )}
            {renderField("Address", address.address)}
            {renderField("Shipping Type", address.shipping_type)}
            {renderField("Area", address.area)}
            {renderField("Division", address.division)}
            {renderField("District", address.district)}
            {renderField("Thana", address.thana)}
            
          </div>
        )}


        {confirmDelete && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h3 className="text-lg font-semibold">Confirm Delete</h3>
                  <p className="text-gray-600">Are you sure you want to delete this address?</p>
                  <div className="mt-4 flex justify-end space-x-2">
                      <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                          Cancel
                      </button>
                      <button
                          onClick={() => {
                              handleDelete();
                              setConfirmDelete(null);
                            }}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                      >
                          Delete
                      </button>
                  </div>
              </div>
          </div>
      )}

      </div>
    );
  };

  export default AddressItem ;