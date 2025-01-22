import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";

const initialState = {
    isLoading: false,
    profile: null,
    error: null,
    updateLoading:false,
    updateError: null,
};

//get profile
export const handleGetProfile = createAsyncThunk('profile/handleGetProfile', async (_, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.get('api/accounts/profile/');
      console.log('get profile response',response);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
});

// profile update
export const handleProfileUpdate = createAsyncThunk('profile/handleProfileUpdate', async (formData, { rejectWithValue }) => {
    try {
       // Import axiosSetup only when needed to avoid circular dependency issues
       const api = (await import('../../api/axiosSetup')).default;
       const response = await api.put('api/accounts/profile/', formData);
      console.log('profile update response',response);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
});

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {},
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
            state.error = action.payload.error
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
        
    }
});

export default profileSlice.reducer;