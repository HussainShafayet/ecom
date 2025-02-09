import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";

const initialState = {
    isLoading: false,
    profile: null,
    error: null,
    updateLoading:false,
    updateError: null,
    adrressLoading: false,
    addresses: [],
    addressError: null,
    isAddAddress: false,
    addressFormData: {
        "title": "",
        "shipping_type": "",
        "address": "",
        "area": "",
        "division": "",
        "district": "",
        "thana": ""
    },
    errors: {},
    touched: {},
    districts: [],
    upazilas: [],
};

//get profile
export const handleGetProfile = createAsyncThunk('profile/handleGetProfile', async (_, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.get('/accounts/profile/');
      console.log('get profile response',response);
      return response.data.data;
    } catch (error) {
        console.log('get profile error: ', error);
        
      return rejectWithValue(error.response?.data || error.message || error);
    }
});

// profile update
export const handleProfileUpdate = createAsyncThunk('profile/handleProfileUpdate', async (formData, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.put('/accounts/profile/', formData);
      console.log('profile update response',response);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
});

// address get 
export const handleGetAddress = createAsyncThunk('profile/handleGetAddress', async (_, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.get('/accounts/addresses/');
      console.log('get address response',response);
      return response.data.data;
    } catch (error) {
        console.log('get address error: ', error);
        
      return rejectWithValue(error?.response?.data || error.message);
    }
});

// address create 
export const handleAddressCreate = createAsyncThunk('profile/handleAddressCreate', async (formData, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.post('/accounts/addresses/', formData);
      console.log('create address response',response);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
});

// address update
export const handleAddressUpdate = createAsyncThunk('profile/handleAddressUpdate', async (formData, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.put(`/accounts/addresses/${formData.id}/`, formData);
      console.log('update address response',response);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
});

export const handleAddressDelete = createAsyncThunk('profile/handleAddressDelete', async (id, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.delete(`/accounts/addresses/${id}/`);
      console.log('address delete response', response);
      return id //response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
});

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        setAddress: (state, action) => {
            state.addresses = action.payload;
        },
        setIsAddAddress: (state, action) =>{
            state.isAddAddress = action.payload;
        },
        updateAddressFormData: (state, action) => {
            state.addressFormData = { ...state.addressFormData, ...action.payload };
        },
        updateTouched: (state, action) => {
            state.touched = { ...state.touched, ...action.payload };
            
        },
        setErrors: (state, action) => {
            state.errors = action.payload;
        },
        setDistricts: (state, action) => {
            state.districts = action.payload;
        },
        setUpazilas: (state, action) => {
            state.upazilas = action.payload;
        },
        resetAddressForm: (state) => {
            state.addressFormData = initialState.addressFormData;
            state.errors = {};
            state.touched = {};
            state.districts = [];
            state.upazilas = [];
        }, 
    },
    extraReducers: (builder) =>{
        builder
        //get profile
        .addCase(handleGetProfile.pending, (state)=>{
            state.isLoading = true;
        })
        .addCase(handleGetProfile.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.profile = action.payload;
        })
        .addCase(handleGetProfile.rejected, (state, action)=>{
            state.isLoading = false;
            
            state.error = action.payload.error || action.payload;
        })

        //profile update
         .addCase(handleProfileUpdate.pending, (state)=>{
            state.updateLoading = true;
        })
        .addCase(handleProfileUpdate.fulfilled, (state, action)=>{
            state.updateLoading = false;
            state.profile = action.payload;
        })
        .addCase(handleProfileUpdate.rejected, (state, action)=>{
            state.updateLoading = false;
            state.updateError = action.payload.error
        })



        //get address
         .addCase(handleGetAddress.pending, (state)=>{
            state.adrressLoading = true;
        })
        .addCase(handleGetAddress.fulfilled, (state, action)=>{
            state.adrressLoading = false;
            state.addresses = action.payload;
            
        })
        .addCase(handleGetAddress.rejected, (state, action)=>{
            state.adrressLoading = false;
            state.addressError = action.payload.error || action.payload;
        })

        //address create
         .addCase(handleAddressCreate.pending, (state)=>{
            state.adrressLoading = true;
        })
        .addCase(handleAddressCreate.fulfilled, (state, action)=>{
            state.adrressLoading = false;
            state.addresses = [...state.addresses, action.payload];
        })
        .addCase(handleAddressCreate.rejected, (state, action)=>{
            state.adrressLoading = false;
            state.addressError = action.payload.error;
        })

         //address update
         .addCase(handleAddressUpdate.pending, (state)=>{
            state.adrressLoading = true;
        })
        .addCase(handleAddressUpdate.fulfilled, (state, action)=>{
            state.adrressLoading = false;
            const updateObj = action.payload.data;

            state.addresses = state.addresses.map((item)=>{
                return item.id === updateObj.id ? ({...item, ...updateObj}) : item
            });
            
        })
        .addCase(handleAddressUpdate.rejected, (state, action)=>{
            state.adrressLoading = false;
            state.addressError = action.payload.error;
        })


        //address delete
        .addCase(handleAddressDelete.pending, (state)=>{
            state.adrressLoading = true;
        })
        .addCase(handleAddressDelete.fulfilled, (state, action)=>{
            state.adrressLoading = false;
            
            const delete_id = action.payload;

            state.addresses = state.addresses.filter((item)=> item.id != delete_id);
            
        })
        .addCase(handleAddressDelete.rejected, (state, action)=>{
            state.adrressLoading = false;
            state.addressError = action.payload.error;
        })
        
    }
});
export const {setAddress, setIsAddAddress, updateAddressFormData,
updateTouched,
setErrors,
  setDistricts,
  setUpazilas,
  resetAddressForm,
} = profileSlice.actions;

export default profileSlice.reducer;