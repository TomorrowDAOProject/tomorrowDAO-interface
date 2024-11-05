'use client';

import {
  did,
  Asset as AssetV2,
  did,
  PortkeyAssetProvider as PortkeyAssetProviderV2,
} from '@portkey/did-ui-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { LoginStatusEnum } from '@aelf-web-login/wallet-adapter-base';
import { LeftOutlined } from '@ant-design/icons';

import './index.css';
import { LoginStatusEnum } from '@portkey/types';

export interface IMyAssetProps {
  redirect?: boolean;
  onBack?: () => void;
}
export default function MyAsset(props: IMyAssetProps) {
  const isLoginOnChain = did.didWallet.isLoginStatus === LoginStatusEnum.SUCCESS;
  const { redirect = true, onBack } = props;
  const router = useRouter();
  const { walletInfo: wallet } = useConnectWallet();
  const Asset = AssetV2;
  const PortkeyAssetProvider = PortkeyAssetProviderV2;
  const isLoginOnChain = did.didWallet.isLoginStatus === LoginStatusEnum.SUCCESS;

  useEffect(() => {
    if (!wallet?.address && redirect) {
      router.push('/');
    }
  }, [wallet, router]);

  return (
    <div className={'assets-wrap'}>
      <PortkeyAssetProvider
        originChainId={wallet?.extraInfo?.portkeyInfo?.chainId as Chain}
        pin={wallet?.extraInfo?.portkeyInfo?.pin}
        isLoginOnChain={isLoginOnChain}
      >
        <Asset
          isShowRamp={true}
          isShowRampBuy={true}
          isShowRampSell={true}
          backIcon={<LeftOutlined />}
          onOverviewBack={() => {
            if (onBack) {
              onBack();
            } else {
              router.back();
            }
          }}
        />
      </PortkeyAssetProvider>
    </div>
  );
}
