import { createSlice } from '@reduxjs/toolkit';
import { HYDRATE } from 'next-redux-wrapper';
import { TAppState } from 'redux/store';
import { TWalletInfoType } from 'types';

export interface IUserInfoState {
  userInfo: TUserInfoType;
  walletInfo?: TWalletInfoType;
}

export const logOutUserInfo: TUserInfoType = {
  address: '',
  fullAddress: '',
  name: '',
  profileImage: '',
  profileImageOriginal: '',
  bannerImage: '',
  email: '',
  twitter: '',
  instagram: '',
};

const initialState: IUserInfoState = {
  userInfo: logOutUserInfo,
  walletInfo: {
    address: '',
  },
};

// Actual Slice
export const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    setWalletInfo(state, action) {
      state.walletInfo = action.payload;
    },
    setUserInfo(state, action) {
      state.userInfo = action.payload;
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

export const { setWalletInfo, setUserInfo } = userInfoSlice.actions;
export const getMyAddress = (state: TAppState) => state.userInfo.userInfo.address;
export default userInfoSlice.reducer;
