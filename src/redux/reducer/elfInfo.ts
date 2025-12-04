import { createSlice } from '@reduxjs/toolkit';
import {
  connectServer,
  connectUrl,
  curChain,
  graphqlServer,
  networkType,
  portkeyServer,
  rpcUrlAELF,
  rpcUrlTDVV,
  rpcUrlTDVW,
} from 'config';
import { HYDRATE } from 'next-redux-wrapper';
import { TAppState } from 'redux/store';

export interface IAelfInfoState {
  elfInfo: TConfigItems;
}

const initialState: IAelfInfoState = {
  elfInfo: {
    networkType: networkType,
    rpcUrlAELF: rpcUrlAELF,
    rpcUrlTDVV: rpcUrlTDVV,
    rpcUrlTDVW: rpcUrlTDVW,
    connectServer: connectServer,
    graphqlServer: graphqlServer,
    portkeyServer: portkeyServer,
    connectUrl: connectUrl,
    curChain: curChain,
  },
};

// Actual Slice
export const elfInfoSlice = createSlice({
  name: 'elfInfo',
  initialState,
  reducers: {
    setElfInfo(state, action) {
      state.elfInfo = action.payload;
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

export const { setElfInfo } = elfInfoSlice.actions;

export const getElfInfo = (state: TAppState) => state.elfInfo.elfInfo;

export default elfInfoSlice.reducer;
