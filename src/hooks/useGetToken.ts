import { useCallback } from 'react';
import { fetchToken } from 'api/request';
import useDiscoverProvider from './useTokenDiscoverProvider';
import { sleep } from '@portkey/utils';
import { IContractError } from 'types';
import { formatErrorMsg } from 'contract/util';
import { emitLoading } from 'utils/myEvent';
import { getCaHashAndOriginChainIdByWallet } from 'utils/wallet';
import { getLocalJWT } from 'utils/localJWT';
import { curChain, networkType } from 'config';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { toast } from 'react-toastify';

const AElf = require('aelf-sdk');

const hexDataCopywriter = `Welcome to TMRWDAO! Click to sign in to the TMRWDAO platform! This request will not trigger any blockchain transaction or cost any gas fees.

signature: `;
export const useGetToken = () => {
  const {
    walletInfo: wallet,
    walletType,
    disConnectWallet,
    getSignature,
    isConnected,
  } = useConnectWallet();
  const { getSignatureAndPublicKey } = useDiscoverProvider();

  const isConnectWallet = isConnected;

  const getTokenFromServer: (props: {
    params: ITokenParams;
    needLoading?: boolean;
    retryCount?: number;
  }) => Promise<ITokenRes | null> = useCallback(
    async (props: { params: ITokenParams; needLoading?: boolean; retryCount?: number }) => {
      const { params, needLoading = false, retryCount = 20 } = props;
      try {
        needLoading && emitLoading(true, 'Authorize account...');
        const rest = await fetchToken(params);
        needLoading && emitLoading(false);
        return rest;
      } catch (error) {
        if (retryCount) {
          await sleep(1000);
          const retry = retryCount - 1;
          return getTokenFromServer({
            ...props,
            retryCount: retry,
          });
        } else {
          toast.error('Failed to obtain authorization token');
          isConnectWallet && disConnectWallet();
          needLoading && emitLoading(false);
          return null;
        }
      }
    },
    [disConnectWallet, isConnectWallet],
  );

  const checkTokenValid = useCallback(async () => {
    // const { caHash } = await getCaHashAndOriginChainIdByWallet(wallet, walletType);
    // const managerAddress = await getManagerAddressByWallet(wallet, walletType);
    const key = `ELF_${wallet?.address}_${curChain}_${networkType}`;
    if (!isConnected) return false;
    const accountInfo = getLocalJWT(key);

    return accountInfo;
  }, [isConnected, wallet?.address]);

  // getToken
  const getToken: (params?: {
    needLoading?: boolean;
  }) => Promise<null | ITokenRes> = async (params?: { needLoading?: boolean }) => {
    const { needLoading } = params || {};
    console.log('getToken wallet', wallet, isConnected);
    if (!isConnected || !wallet) return null;

    const timestamp = Date.now();
    const plainTextOrigin = `${wallet?.address}-${timestamp}`;
    // const plainText: any = Buffer.from(plainTextOrigin).toString('hex').replace('0x', '');
    const signInfo = AElf.utils.sha256(plainTextOrigin);
    const discoverSignHex = Buffer.from(hexDataCopywriter + plainTextOrigin).toString('hex');

    let publicKey = '';
    let signature = '';
    let source = '';

    // ------------------------------------- signature -------------------------------------
    const { caHash, originChainId } = await getCaHashAndOriginChainIdByWallet(wallet, walletType);
    console.log('getToken caHash, originChainId', caHash, originChainId, walletType, wallet);
    if (
      walletType === WalletTypeEnum.discover ||
      walletType === WalletTypeEnum.fairyVault ||
      walletType === WalletTypeEnum.web
    ) {
      try {
        const { pubKey, signatureStr } = await getSignatureAndPublicKey(discoverSignHex, signInfo);
        publicKey = pubKey || '';
        signature = signatureStr || '';
        source = 'portkey';
      } catch (error) {
        const resError = error as IContractError;
        const errorMessage = formatErrorMsg(resError).errorMessage.message;
        toast.error(errorMessage);
        isConnectWallet && disConnectWallet();
        return null;
      }
    } else {
      const sign = await getSignature({
        appName: 'TomorrowDAOServer',
        address: wallet!.address,
        signInfo:
          walletType === WalletTypeEnum.aa
            ? Buffer.from(`${wallet?.address}-${timestamp}`).toString('hex')
            : AElf.utils.sha256(plainTextOrigin),
      });
      if (sign?.errorMessage) {
        const errorMessage = formatErrorMsg(sign?.errorMessage as unknown as IContractError)
          .errorMessage.message;
        toast.error(errorMessage);
        isConnectWallet && disConnectWallet();
        return null;
      }
      publicKey = wallet?.extraInfo?.publicKey || '';
      signature = sign?.signature ?? '';
      if (walletType === WalletTypeEnum.elf) {
        source = 'nightElf';
      } else {
        source = 'portkey';
      }
    }
    // ------------------------------------- request api -------------------------------------
    const reqParams = {
      grant_type: 'signature',
      scope: 'TomorrowDAOServer',
      client_id: 'TomorrowDAOServer_App',
      timestamp,
      signature,
      source,
      publickey: publicKey,
      chain_id: originChainId,
      address: wallet?.address,
    } as ITokenParams;
    if (caHash) {
      reqParams.ca_hash = caHash;
    }
    const res = await getTokenFromServer({
      params: reqParams,
      needLoading,
    });

    // checkJoined(wallet.address);
    return res;
  };

  return { getToken, checkTokenValid };
};
