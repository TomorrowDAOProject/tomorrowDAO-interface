import { createSlice } from '@reduxjs/toolkit';
import { TAppState } from 'redux/store';
import { HYDRATE } from 'next-redux-wrapper';

const initialState: {
  ethbtc: number;
  ethusd: number;
} = {
  ethbtc: NaN,
  ethusd: NaN,
};

// Actual Slice
export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setEthData(state, action) {
      state = action.payload;
      return state;
    },
  },

  // Special reducer for hydrating the state. Special case for next-redux-wrapper
  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.data,
      };
    },
  },
});

export const { setEthData } = dataSlice.actions;
export const selectData = (state: TAppState) => state.data;
export default dataSlice.reducer;
