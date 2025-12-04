import { createSlice } from '@reduxjs/toolkit';
import { TAppState } from 'redux/store';
import { HYDRATE } from 'next-redux-wrapper';
import { TInfoStateType } from 'redux/types/reducerTypes';

const initialState: TInfoStateType = {
  isMobile: false,
  isSmallScreen: false,
  baseInfo: {
    rpcUrl: '',
  },
  theme: 'light',
};

// Actual Slice
export const infoSlice = createSlice({
  name: 'info',
  initialState,
  reducers: {
    setIsMobile(state, action) {
      state.isMobile = action.payload;
    },
  },

  // Special reducer for hydrating the state. Special case for next-redux-wrapper
  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.info,
      };
    },
  },
});

export const { setIsMobile } = infoSlice.actions;
export const selectInfo = (state: TAppState) => state.info;
export default infoSlice.reducer;
