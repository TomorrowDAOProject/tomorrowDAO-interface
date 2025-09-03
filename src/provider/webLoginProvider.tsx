'use client';
import getChainIdQuery from 'utils/url';
import { usePathname } from 'next/navigation';
import { getReferrerCode } from 'app/telegram/votigram/util/start-params';
import { NetworkEnum, SignInDesignEnum, TChainId } from '@aelf-web-login/wallet-adapter-base';
import { PortkeyDiscoverWallet } from '@aelf-web-login/wallet-adapter-portkey-discover';
import { PortkeyInnerWallet } from '@aelf-web-login/wallet-adapter-portkey-web';
import { NightElfWallet } from '@aelf-web-login/wallet-adapter-night-elf';
import { IConfigProps } from '@aelf-web-login/wallet-adapter-bridge';
import { WebLoginProvider } from '@aelf-web-login/wallet-adapter-react';
import { FairyVaultDiscoverWallet } from '@aelf-web-login/wallet-adapter-fairy-vault-discover';
import { did } from '@portkey/did';
import {
  NetworkDaoHomePathName,
  connectServer,
  connectUrl,
  curChain,
  graphqlServer,
  networkType,
  portkeyServer,
  rpcUrlAELF,
  rpcUrlTDVV,
  rpcUrlTDVW,
  TELEGRAM_BOT_ID,
} from 'config';
import { useMemo } from 'react';
import useResponsive from 'hooks/useResponsive';
// import './telegram';

type TNodes = {
  AELF: { chainId: string; rpcUrl: string };
  tDVW: { chainId: string; rpcUrl: string };
  tDVV: { chainId: string; rpcUrl: string };
};

type TNodeKeys = keyof TNodes;
const APP_NAME = 'TMRWDAO';

function addBasePath(url: string) {
  if (String(url).startsWith('http')) {
    return url;
  }
  return `${url}`;
}
function moveKeyToFront(nodes: TNodes, key: TNodeKeys) {
  const reordered = {} as TNodes;
  if (nodes[key]) {
    reordered[key] = nodes[key];
  }
  Object.keys(nodes).forEach((k) => {
    const newKey = k as TNodeKeys;
    if (newKey !== key) {
      reordered[newKey] = nodes[newKey];
    }
  });
  return reordered;
}
// const WebLoginProviderDynamic = (props: WebLoginProviderProps) => {
//   const info = store.getState().elfInfo.elfInfo;

//   return <WebLoginProvider {...props} />;
// };

// eslint-disable-next-line import/no-anonymous-default-export
export default function LoginSDKProvider({ children }: { children: React.ReactNode }) {
  const info: Record<string, string> = {
    networkType: networkType,
    rpcUrlAELF: rpcUrlAELF,
    rpcUrlTDVV: rpcUrlTDVV,
    rpcUrlTDVW: rpcUrlTDVW,
    connectServer: connectServer,
    graphqlServer: graphqlServer,
    portkeyServer: portkeyServer,
    connectUrl: connectUrl,
    curChain: curChain,
  };
  const server = info.portkeyServer;
  const referrerCode = getReferrerCode();

  const didConfig = {
    graphQLUrl: info.graphqlServer,
    connectUrl: addBasePath(connectUrl || ''),
    serviceUrl: server,
    requestDefaults: {
      timeout: networkType === 'TESTNET' ? 300000 : 80000,
      baseURL: addBasePath(server || ''),
    },
    socialLogin: {
      Portkey: {
        websiteName: APP_NAME,
        websiteIcon: '',
      },
      Telegram: {
        botId: TELEGRAM_BOT_ID,
      },
    },
    referralInfo: {
      referralCode: referrerCode ?? '',
      projectCode: '13027',
    },
  };
  did.setConfig(didConfig);
  // const connectUrl = info?.connectUrl;
  // const networkType = (info.networkType || 'TESTNET') as NetworkType;

  const pathName = usePathname();
  const isNetWorkDao = pathName.startsWith(NetworkDaoHomePathName);
  const { isMD } = useResponsive();

  const getChainId = () => {
    if (isNetWorkDao) {
      const chain = getChainIdQuery();
      return chain.chainId ?? 'AELF';
    }
    return curChain;
  };
  const chainId = getChainId();
  const getNodes = () => {
    const nodes = {
      AELF: {
        chainId: 'AELF',
        rpcUrl: info?.rpcUrlAELF as unknown as string,
      },
      tDVW: {
        chainId: 'tDVW',
        rpcUrl: info?.rpcUrlTDVW as unknown as string,
      },
      tDVV: {
        chainId: 'tDVV',
        rpcUrl: info?.rpcUrlTDVV as unknown as string,
      },
    };
    if (isNetWorkDao) {
      const chain = getChainIdQuery();
      const chainId = chain.chainId ?? 'AELF';
      if (chainId === 'tDVW') {
        return moveKeyToFront(nodes, 'tDVW');
      }
      if (chainId === 'tDVV') {
        return moveKeyToFront(nodes, 'tDVV');
      }
    }
    return nodes;
  };
  const nodes = getNodes();

  const baseConfig: IConfigProps['baseConfig'] = {
    enableAcceleration: true,
    appName: APP_NAME,
    theme: 'dark',
    showVconsole: true,
    networkType: networkType === 'TESTNET' ? NetworkEnum.TESTNET : NetworkEnum.MAINNET,
    chainId: chainId as TChainId,
    sideChainId: chainId as TChainId,
    design: SignInDesignEnum.SocialDesign,
  };

  const wallets = [
    new PortkeyInnerWallet({
      networkType: networkType === 'TESTNET' ? NetworkEnum.TESTNET : NetworkEnum.MAINNET,
      chainId: chainId as TChainId,
      disconnectConfirm: true,
    }),
    new PortkeyDiscoverWallet({
      networkType: networkType === 'TESTNET' ? NetworkEnum.TESTNET : NetworkEnum.MAINNET,
      chainId: chainId as TChainId,
      autoRequestAccount: true,
      autoLogoutOnDisconnected: true,
      autoLogoutOnNetworkMismatch: true,
      autoLogoutOnAccountMismatch: true,
      autoLogoutOnChainMismatch: true,
    }),
    new FairyVaultDiscoverWallet({
      networkType: networkType === 'TESTNET' ? NetworkEnum.TESTNET : NetworkEnum.MAINNET,
      chainId: chainId as TChainId,
      autoRequestAccount: true,
      autoLogoutOnDisconnected: true,
      autoLogoutOnNetworkMismatch: true,
      autoLogoutOnAccountMismatch: true,
      autoLogoutOnChainMismatch: true,
    }),
    new NightElfWallet({
      chainId: chainId as TChainId,
      appName: APP_NAME,
      connectEagerly: true,
      defaultRpcUrl:
        (info?.[`rpcUrl${String(info?.curChain).toUpperCase()}`] as unknown as string) ||
        info?.rpcUrlTDVW ||
        '',
      nodes: nodes,
    }),
  ];

  const config: IConfigProps = {
    baseConfig,
    wallets,
  };

  const extraElementInConnectModal = useMemo(
    () => (
      <div
        style={{
          color: baseConfig.theme === 'dark' ? '#fff' : 'black',
        }}
      >
        By continuing, you agree to the Terms of Service and Privacy Policy.
      </div>
    ),
    [],
  );

  return (
    <WebLoginProvider config={config} extraElementInConnectModal={extraElementInConnectModal}>
      {children}
    </WebLoginProvider>
  );
}
