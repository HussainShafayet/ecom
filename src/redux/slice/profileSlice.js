import {createAsyncThunk, createSlice, isAnyOf} from "@reduxjs/toolkit";
import {logoutUser, sessionEnded} from "./authSlice";
import {formatWait, retryAfterSeconds} from "../../api/errors";

const initialState = {
    isLoading: false,
    profile: null,
    error: null,
    updateLoading:false,
    updateError: null,
    updateFieldErrors: {}, // the backend's `field_errors` of a refused save ({username: ["..."]}), drawn under their fields
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
    // what the backend said about the code it just sent ({resend_after, expires_in, length}), per field; null until one was sent
    otpTiming: {
        phone: null,
        email: null,
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
    infoEditing: false,
};

// The sentence for a failed page load: the backend's own, else a general one (never an object, React cannot draw one)
const errorText = (payload) => payload?.error || payload?.errors?.[0] || (typeof payload === 'string' ? payload : 'Something went wrong!');

// A refused "send a code": the wait of a 429 said in words, else the backend's sentences
const codeRefusal = (payload) => (
    payload?.retry_after
        ? [`You have asked for too many codes. Please try again in ${formatWait(payload.retry_after)}.`]
        : (payload?.errors || (payload?.error ? [payload.error] : ['Failed to send the code.']))
);

//get profile
export const handleGetProfile = createAsyncThunk('profile/handleGetProfile', async (_, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.get('/accounts/profile/', { section: "get-profile"});
      return response?.data?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error?.message || error);
    }
});

// profile update: a plain object goes as JSON (so "" clears an e-mail, which multipart cannot say), a FormData is the picture
export const handleProfileUpdate = createAsyncThunk('profile/handleProfileUpdate', async (formData, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.put('/accounts/profile/', formData, { section: "profile-update"});
      return response?.data?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || {errors: ['Could not save. Please try again.']});
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
      return { data: response?.data, field };
    } catch (error) {
      return rejectWithValue({...error.response?.data, retry_after: retryAfterSeconds(error)});
    }
});

export const handleSubmitOtp = createAsyncThunk('profile/handleSubmitOtp', async ({formData, field}, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.post(`accounts/verify-otp-for-profile/`,formData, { section: "submit-otp"});
      return { data: response?.data, field };
    } catch (error) {
      return rejectWithValue(error.response?.data);
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
        // Opening or leaving the edit form starts it clean: nothing verified, no old refusal
        setInfoEditing: (state, action) => {
            state.infoEditing = action.payload;
            state.updateError = null;
            state.updateFieldErrors = {};
            state.verified = {email: false, phone: false};
            state.verifyError = {phone: null, email: null};
            state.verifyPopup = {phone: false, email: false};
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
            state.error = errorText(action?.payload);
        })

        //profile update
         .addCase(handleProfileUpdate.pending, (state)=>{
            state.updateLoading = true;
            state.updateFieldErrors = {};
        })
        .addCase(handleProfileUpdate.fulfilled, (state, action)=>{
            state.updateLoading = false;
            state.updateError = null;
            state.profile = action?.payload;
            // a new picture (multipart) leaves the edit form as it is; a saved form is done, and its verifications are spent
            if (!(action.meta.arg instanceof FormData)) {
                state.infoEditing = false;
                state.verified = {email: false, phone: false};
            }
        })
        .addCase(handleProfileUpdate.rejected, (state, action)=>{
            state.updateLoading = false;
            state.updateError = action?.payload?.errors || (action?.payload?.error ? [action.payload.error] : ['Something went wrong.']);
            state.updateFieldErrors = action?.payload?.field_errors || {};
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
            
            state.addresses = state.addresses?.map((item)=>{
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

            state.addresses = state.addresses.filter((item)=> item.id !== delete_id);
            
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
            const {resend_after, expires_in, length} = action.payload?.data?.data || {};
            state.otpTiming[field] = resend_after || expires_in || length ? {resend_after, expires_in, length} : null;
            state.verifyPopup[field] = true;
            
        })
        .addCase(handleSendOtp.rejected, (state, action)=>{
            const field = action.meta.arg.field;
            state.loading[field] = false;
            state.verifyError[field] = codeRefusal(action.payload);
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
        })
        .addCase(handleSubmitOtp.rejected, (state, action)=>{
            const field = action.meta.arg.field;
            state.otpSubmitLoading[field] = false;
            state.otpSubmitError[field] = action.payload?.errors || (action.payload?.error ? [action.payload.error] : ['That code did not work. Please try again.']);
        })

        //nothing of one customer's profile or addresses stays behind for the next person on this browser
        .addMatcher(isAnyOf(logoutUser.fulfilled, logoutUser.rejected, sessionEnded), () => initialState);
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
  setInfoEditing,
} = profileSlice.actions;

export default profileSlice.reducer;