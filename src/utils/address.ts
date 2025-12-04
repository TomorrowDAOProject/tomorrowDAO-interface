import { curChain } from 'config';
import { curChain as testnetSideChain } from 'config/testnet';
import { curChain as mainnetSideChain } from 'config/mainnet';

export const formatAddress = (address: string) => {
  return `ELF_${address}_${curChain}`;
};

export const trimAddress = (address: string) => {
  if (address.startsWith('ELF_')) {
    if (address.endsWith(testnetSideChain) || address.endsWith(mainnetSideChain)) {
      return address.slice(4, -5);
    }
  }
  return address;
};
