import { combineReducers } from 'redux';
import { useSelector as useReduxSelector, TypedUseSelectorHook } from 'react-redux';
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
// import { persistReducer, persistStore } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
import InfoReducer, { infoSlice } from './reducer/info';
import DataReducer, { dataSlice } from './reducer/data';

import elfInfoReducer, { elfInfoSlice } from './reducer/elfInfo';
import UserInfoReducer, { userInfoSlice } from './reducer/userInfo';
import daoCreateReducer, { daoCreateSlice } from './reducer/daoCreate';
import loginStatusReducer, { loginStatusSlice } from './reducer/loginStatus';
import {
  common,
  getOrganization,
  getProposalList,
  getProposalSelectList,
  setModifyOrg,
  handleContract,
} from '../app/network-dao/_src/redux/reducers';

const rootReducer = combineReducers({
  [infoSlice.name]: InfoReducer,
  [dataSlice.name]: DataReducer,
  [userInfoSlice.name]: UserInfoReducer,
  [elfInfoSlice.name]: elfInfoReducer,
  [daoCreateSlice.name]: daoCreateReducer,
  [loginStatusSlice.name]: loginStatusReducer,
  common,
  organizations: getOrganization,
  proposals: getProposalList,
  proposalSelect: getProposalSelectList,
  proposalModify: setModifyOrg,
  voteContracts: handleContract,
});

const makeStore = () => {
  // const persistConfig = {
  //   key: 'nextjs',
  //   storage,
  // };

  // const persistedReducer = persistReducer(persistConfig, rootReducer);

  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware: any) =>
      getDefaultMiddleware({
        thunk: true,
        immutableCheck: false,
        serializableCheck: false,
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });

  return {
    ...store,
    // __persistor: persistStore(store),
  };
};

export type TAppStore = ReturnType<typeof makeStore>;
export type TAppDispatch = typeof store.dispatch;
export type TAppState = ReturnType<TAppStore['getState']>;
export type TAppThunk<ReturnType = void> = ThunkAction<ReturnType, TAppState, unknown, Action>;

export const store: TAppStore = makeStore();
export const dispatch: TAppDispatch = store.dispatch;
export const useSelector: TypedUseSelectorHook<TAppState> = useReduxSelector;
