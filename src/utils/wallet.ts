import { GetCAHolderByManagerParams } from '@portkey/services';
import { ChainId, MethodsWallet } from '@portkey/provider-types';
import { TWalletInfo, WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { did } from '@portkey/did-ui-react';

import { pubKeyToAddress } from './aelfBase';
import { curChain } from 'config';

export const getManagerAddressByWallet = async (
  wallet: TWalletInfo,
  walletType: WalletTypeEnum,
  pubkey?: string,
): Promise<string> => {
  let managerAddress;
  if (walletType === WalletTypeEnum.discover) {
    managerAddress = await wallet?.extraInfo?.provider?.request({
      method: MethodsWallet.GET_WALLET_CURRENT_MANAGER_ADDRESS,
    });
  } else {
    managerAddress = wallet?.extraInfo?.portkeyInfo?.walletInfo.address;
  }

  if (!managerAddress && pubkey) {
    managerAddress = pubKeyToAddress(pubkey);
  }

  return managerAddress || '';
};

export const getCaHashAndOriginChainIdByWallet = async (
  wallet: TWalletInfo,
  walletType: WalletTypeEnum,
): Promise<{ caHash: string; originChainId: ChainId }> => {
  let caHash, originChainId;
  if (walletType === WalletTypeEnum.discover || walletType === WalletTypeEnum.web) {
    const res = await did.services.getHolderInfoByManager({
      caAddresses: [wallet?.address],
    } as unknown as GetCAHolderByManagerParams);
    const caInfo = res[0];
    caHash = caInfo?.caHash;
    originChainId = caInfo?.chainId as ChainId;
  } else {
    caHash = wallet?.extraInfo?.portkeyInfo?.caInfo?.caHash;
    originChainId = wallet?.extraInfo?.portkeyInfo?.chainId;
  }
  return {
    caHash: caHash || '',
    originChainId: originChainId || curChain,
  };
};
