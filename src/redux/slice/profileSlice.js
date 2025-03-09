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

    loading: {
        phone: false,
        email: false,
    },
    otpToken: {
        phone: '',
        email: '',
    },
    message: {
        phone: '',
        email: '',
    },
    verifyPopup: {
        phone: false,
        email: false,
    },
    verified: {
        email: false,
        phone: false,
    },
    verifyError: {
        phone: null,
        email: null,
    },
    otpSubmitLoading: {
        email: false,
        phone: false,
    },
    otpSubmitError: {
        email: null,
        phone: null,
    },
    previousValue: {
        email: '',
        phone: '',
    },
    otp: '',
    infoEditing: false,
    image: '',
};

//get profile
export const handleGetProfile = createAsyncThunk('profile/handleGetProfile', async (_, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.get('/accounts/profile/', { section: "get-profile"});
      console.log('get profile response',response);
      return response?.data?.data;
    } catch (error) {
        console.log('get profile error: ', error);
        
      return rejectWithValue(error?.response?.data || error?.message || error);
    }
});

// profile update
export const handleProfileUpdate = createAsyncThunk('profile/handleProfileUpdate', async (formData, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.put('/accounts/profile/', formData, { section: "profile-update"});
      console.log('profile update response',response);
      return response?.data?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data);
    }
});

// address get 
export const handleGetAddress = createAsyncThunk('profile/handleGetAddress', async (_, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.get('/accounts/addresses/', { section: "get-address"});
      console.log('get address response',response);
      return response?.data?.data || [];
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
       const response = await api.post('/accounts/addresses/', formData, { section: "create-address"});
      console.log('create address response',response);
      return response?.data?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
});

// address update
export const handleAddressUpdate = createAsyncThunk('profile/handleAddressUpdate', async (formData, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.put(`/accounts/addresses/${formData.id}/`, formData, { section: "update-address"});
      console.log('update address response',response);
      return response?.data?.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
});

export const handleAddressDelete = createAsyncThunk('profile/handleAddressDelete', async (id, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.delete(`/accounts/addresses/${id}/`, { section: "delete-address"});
      console.log('address delete response', response);
      return id //response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
});

export const handleSendOtp = createAsyncThunk('profile/handleSendOtp', async ({ formData, field }, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.post(`accounts/request-otp/`,formData, { section: "send-otp-verify"});
      console.log('send otp for verify response', response);
      return { data: response?.data, field };
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
});

export const handleSubmitOtp = createAsyncThunk('profile/handleSubmitOtp', async ({formData, field}, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.post(`accounts/verify-otp-for-profile/`,formData, { section: "submit-otp"});
      console.log('submit otp response', response);
      return { data: response?.data, field };
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
        statusUpdateVerifyPopup: (state, action) => {
            const {field} = action.payload;
            state.verifyPopup[field] = false;
        },
        statusUpdateVerified: (state, action) => {
            const {field} = action.payload;
            state.verified[field] = false;
        },
        setOtp: (state, action) => {
            state.otp = action.payload;
        },
        setInfoEditing: (state, action) => {
            state.infoEditing = action.payload;
        },
        updatePreviousValue: (state, action) => {
            const {field, value} = action.payload;
            state.previousValue[field] = value;
        },
        setImage: (state, action) => {
            state.image = action.payload;
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
            state.error = null;
            state.profile = action?.payload;
        })
        .addCase(handleGetProfile.rejected, (state, action)=>{
            state.isLoading = false;
            
            state.error = action?.payload?.error || action?.payload  || 'Something went wrong!';
        })

        //profile update
         .addCase(handleProfileUpdate.pending, (state)=>{
            state.updateLoading = true;
        })
        .addCase(handleProfileUpdate.fulfilled, (state, action)=>{
            state.updateLoading = false;
            state.updateError = null;
            state.profile = action?.payload;
            state.infoEditing = false;
        })
        .addCase(handleProfileUpdate.rejected, (state, action)=>{
            state.updateLoading = false;
            state.updateError = action?.payload?.error || action?.payload?.errors || 'Something went wrong';
        })



        //get address
         .addCase(handleGetAddress.pending, (state)=>{
            state.adrressLoading = true;
        })
        .addCase(handleGetAddress.fulfilled, (state, action)=>{
            state.adrressLoading = false;
            state.addressError = null;
            state.addresses = action?.payload || [];
            
        })
        .addCase(handleGetAddress.rejected, (state, action)=>{
            state.adrressLoading = false;
            state.addresses = [];
            state.addressError = action?.payload?.error || action?.payload  || 'Something went wrong!';
        })

        //address create
         .addCase(handleAddressCreate.pending, (state)=>{
            state.adrressLoading = true;
        })
        .addCase(handleAddressCreate.fulfilled, (state, action)=>{
            state.adrressLoading = false;
            state.addressError = null;
            state.addresses = [...state.addresses, action.payload];
        })
        .addCase(handleAddressCreate.rejected, (state, action)=>{
            state.adrressLoading = false;
            state.addressError = action?.payload?.error  || 'Something went wrong!';
        })

         //address update
         .addCase(handleAddressUpdate.pending, (state)=>{
            state.adrressLoading = true;
        })
        .addCase(handleAddressUpdate.fulfilled, (state, action)=>{
            state.adrressLoading = false;
            state.addressError =  null;
            const updateObj = action.payload;
            
            state.addresses = state.addresses.map((item)=>{
                return item.id === updateObj.id ? ({...item, ...updateObj}) : item
            });
            
        })
        .addCase(handleAddressUpdate.rejected, (state, action)=>{
            state.adrressLoading = false;
            state.addressError = action?.payload?.error  || 'Something went wrong!';
        })


        //address delete
        .addCase(handleAddressDelete.pending, (state)=>{
            state.adrressLoading = true;
        })
        .addCase(handleAddressDelete.fulfilled, (state, action)=>{
            state.adrressLoading = false;
            state.addressError = null;
            
            const delete_id = action.payload;

            state.addresses = state.addresses.filter((item)=> item.id != delete_id);
            
        })
        .addCase(handleAddressDelete.rejected, (state, action)=>{
            state.adrressLoading = false;
            state.addressError = action?.payload?.error  || 'Something went wrong!';
        })

        //send otp
        .addCase(handleSendOtp.pending, (state, action)=>{
            const field = action.meta.arg.field; // 'phone' or 'email'
            
            state.loading[field] = true;
            state.verifyError[field] = null; // Clear previous errors
            
        })
        .addCase(handleSendOtp.fulfilled, (state, action)=>{
            const field = action.meta.arg.field;
            
            state.loading[field] = false;
            state.message[field] = action.payload?.data?.message;
            state.otpToken[field] = action.payload?.data?.data?.token;
            state.verifyPopup[field] = true;
            
        })
        .addCase(handleSendOtp.rejected, (state, action)=>{
            const field = action.meta.arg.field;
            const {errors, error } = action.payload;
            
            state.loading[field] = false;
            state.verifyError[field] = errors || error?.message || 'Failed to send OTP';
        })

        //submit otp
        .addCase(handleSubmitOtp.pending, (state, action)=>{
            const field = action.meta.arg.field; // 'phone' or 'email'
            
            state.otpSubmitLoading[field] = true;
            state.otpSubmitError[field] = null; // Clear previous errors
        })
        .addCase(handleSubmitOtp.fulfilled, (state, action)=>{
            const field = action.meta.arg.field;
            
            state.otpSubmitLoading[field] = false;
            state.verifyPopup[field] = false;
            state.verified[field] = true;

            //clear
            state.message[field] = ''
            state.otp = '';
        })
        .addCase(handleSubmitOtp.rejected, (state, action)=>{
            const field = action.meta.arg.field;
            const {errors, error } = action.payload;
            
            state.otpSubmitLoading[field] = false;
            state.otpSubmitError[field] = errors || error?.message || 'Failed to submit OTP';
        })
        
    }
});
export const {setAddress, setIsAddAddress, updateAddressFormData,
updateTouched,
setErrors,
  setDistricts,
  setUpazilas,
  resetAddressForm,
  statusUpdateVerifyPopup,
  statusUpdateVerified, 
  setOtp,
  setInfoEditing,
  updatePreviousValue,
  setImage,
} = profileSlice.actions;

export default profileSlice.reducer;