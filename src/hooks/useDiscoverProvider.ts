import { IPortkeyProvider } from '@portkey/provider-types';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
export default function useDiscoverProvider() {
  const { walletInfo } = useConnectWallet();
  const discoverProvider = async () => {
    const provider: IPortkeyProvider | null = walletInfo?.extraInfo?.provider;

    if (provider) {
      if (!provider.isPortkey) {
        throw new Error('Discover provider found, but check isPortkey failed');
      }
      return provider;
    } else {
      return null;
    }
  };
  return { discoverProvider };
}
