import { useCallback, useEffect, useRef } from 'react';
import { dispatch, useSelector } from 'redux/store';
import { setWalletInfo } from 'redux/reducer/userInfo';
import { cloneDeep } from 'lodash-es';
import { storages } from 'storages';
import { useGetToken } from './useGetToken';
import { setLoginStatus, resetLoginStatus } from 'redux/reducer/loginStatus';
import { useAsyncEffect } from 'ahooks';
import { emitLoading, eventBus, UnAuth, GetTokenLogin } from 'utils/myEvent';
import { apiServer } from 'api/axios';
import { removeJWT, setLocalJWT } from 'utils/localJWT';
import { authManager } from 'utils/walletAndTokenInfo';
import { curChain, networkType } from 'config';
import { useUrlPath } from './useUrlPath';
import { runTimeEnv } from 'utils/env';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { TWalletInfoType } from 'types';
import { webLoginInstance } from 'contract/webLogin';
import { toast } from 'react-toastify';

export const useWalletService = () => {
  const { connectWallet, disConnectWallet, walletType, walletInfo, isConnected, lock } =
    useConnectWallet();
  const loginStatus = useSelector((state) => state.loginStatus);
  const isLogin = loginStatus.loginStatus.isLogin;

  return {
    login: connectWallet,
    logout: disConnectWallet,
    isConnected: isConnected,
    isLogin: isLogin,
    walletType,
    lock,
    wallet: walletInfo,
  };
};

export const useCheckLoginAndToken = () => {
  const { isConnected, disConnectWallet, walletInfo: wallet, walletType } = useConnectWallet();
  const isConnectWallet = isConnected;
  const { getToken, checkTokenValid } = useGetToken();
  const { isTelegram } = useUrlPath();

  const getTokenUpdate = async () => {
    const tokenRes = await getToken({
      needLoading: true,
    });
    // const { caHash } = await getCaHashAndOriginChainIdByWallet(wallet, walletType);
    // const managerAddress = await getManagerAddressByWallet(wallet, walletType);
    const key = `ELF_${wallet?.address}_${curChain}_${networkType}`;
    // // emitLoading(false, 'Authorize account...');
    emitLoading(false);
    if (tokenRes?.access_token) {
      dispatch(
        setLoginStatus({
          hasToken: true,
          isLogin: true,
        }),
      );
      apiServer.setToken(tokenRes?.access_token);
      setLocalJWT(key, tokenRes as LocalJWTData);
    } else {
      await disConnectWallet();
      dispatch(resetLoginStatus());
      toast.error('login failed');
    }
  };
  useAsyncEffect(async () => {
    const waitPublicKey =
      walletType === WalletTypeEnum.discover ||
      walletType === WalletTypeEnum.fairyVault ||
      walletType === WalletTypeEnum.web
        ? true
        : wallet?.extraInfo?.publicKey;
    if (isConnectWallet && wallet && waitPublicKey) {
      if (authManager.isAuthing) return;
      authManager.isAuthing = true;
      emitLoading(true, 'Authorize account...');
      if (!isTelegram) {
        const checkRes = await checkTokenValid();
        if (checkRes) {
          apiServer.setToken(checkRes?.access_token);
          dispatch(
            setLoginStatus({
              hasToken: true,
              isLogin: true,
            }),
          );
          emitLoading(false);
          authManager.isAuthing = false;
          return;
        } else {
          await getTokenUpdate();
        }
      } else {
        await getTokenUpdate();
      }
      eventBus.emit(GetTokenLogin);
      authManager.isAuthing = false;
      // emitLoading(true, 'Authorize account...');
    }
  }, [isConnectWallet, wallet, wallet?.extraInfo?.publicKey, walletType]);

  useEffect(() => {
    if (wallet?.address && isConnected) {
      console.log('gtag report', wallet.address);
      console.log('wallet info', wallet);
      window.gtag('set', 'user_id', wallet.address);
      window.gtag('event', 'login_success', {
        user_id: wallet.address,
      });
    }
  }, [wallet?.address, isConnected]);

  return {
    checkTokenValid,
    getTokenUpdate,
  };
};
export const useWalletInit = () => {
  const { walletInfo, walletType, isConnected, loginError, disConnectWallet } = useConnectWallet();
  const webLoginContext = useConnectWallet();

  const handleClearRef = useRef<() => void>();
  useCheckLoginAndToken();

  const resetAccount = useCallback(() => {
    localStorage.removeItem(storages.daoAccessToken);
    localStorage.removeItem(storages.walletInfo);
    dispatch(resetLoginStatus());
    dispatch(
      setWalletInfo({
        address: '',
        aelfChainAddress: '',
      }),
    );
  }, []);

  useEffect(() => {
    if (walletInfo) {
      const walletInfoToLocal: TWalletInfoType = {
        address: walletInfo?.address || '',
        publicKey: walletInfo?.extraInfo?.publicKey || '',
      };
      if (walletType === WalletTypeEnum.elf) {
        walletInfoToLocal.nightElfInfo = walletInfo.extraInfo?.nightElfInfo;
      }
      if (walletType === WalletTypeEnum.discover || walletType === WalletTypeEnum.fairyVault) {
        walletInfoToLocal.discoverInfo = {
          accounts: walletInfo?.extraInfo?.accounts || {},
          address: walletInfo?.address || '',
          nickName: walletInfo?.extraInfo?.nickName,
        };
      }
      if (walletType === WalletTypeEnum.aa) {
        walletInfoToLocal.portkeyInfo = walletInfo?.extraInfo?.portkeyInfo || {};
      }
      dispatch(setWalletInfo(cloneDeep(walletInfoToLocal)));
    }
  }, [walletInfo, walletType]);

  useEffect(() => {
    if (!walletInfo) {
      return;
    }
    webLoginInstance.setWebLoginContext(webLoginContext);
  }, [webLoginContext, walletInfo]);

  useEffect(() => {
    if (loginError) {
      toast.error(`${loginError?.nativeError?.message || loginError?.message || 'LOGIN_ERROR'}`);
    }
  }, [loginError]);

  useEffect(() => {
    if (!isConnected) {
      resetAccount();
    }
  }, [isConnected, resetAccount]);

  const { isTelegram } = useUrlPath();
  const handleClear = async () => {
    await disConnectWallet();
    dispatch(resetLoginStatus());
    removeJWT();
    if (runTimeEnv === 'client' && isTelegram) {
      window.location.reload();
    }
  };
  handleClearRef.current = handleClear;
  useEffect(() => {
    const clear = () => {
      handleClearRef.current?.();
    };
    eventBus.on(UnAuth, clear);
    return () => {
      eventBus.removeListener(UnAuth, clear);
    };
  }, []);
};
