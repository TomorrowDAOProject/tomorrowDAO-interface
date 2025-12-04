import { curChain } from 'config/testnet';
import { curChain as mainnetSideChain } from 'config/mainnet';
import getChainIdQuery from './url';
export const isSideChain = (chain?: string) => {
  if (!chain) return false;
  return [curChain, mainnetSideChain].includes(chain);
};

export const isSideChainByQueryParams = () => {
  const chainIdQuery = getChainIdQuery();
  const chain = chainIdQuery.chainId;
  if (!chain) return false;
  return [curChain, mainnetSideChain].includes(chain);
};
