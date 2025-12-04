import { createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { TAppState } from 'redux/store';

export interface IDaoCreateState {
  token?: ITokenInfoData;
}

const initialState: IDaoCreateState = {};

// Actual Slice
export const daoCreateSlice = createSlice({
  name: 'daoCreate',
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
    },
  },

  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.info,
      };
    },
  },
});

export const { setToken } = daoCreateSlice.actions;

export const getDaoCreateInfo = (state: TAppState) => state;

export default daoCreateSlice.reducer;
