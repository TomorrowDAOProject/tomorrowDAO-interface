import AElf from 'aelf-sdk';
import { rpcUrlTDVW } from 'config';

export const formatDate = (d: number) => {
  const date = new Date(d);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
};

export const CONTRACT_INSTANCE_MAP: Record<string, any> = {};
const wallet = {
  privateKey: 'f6e512a3c259e5f9af981d7f99d245aa5bc52fe448495e0b0dd56e8406be6f71',
};

export async function getContract(address: string) {
  const fakeWallet = AElf.wallet.getWalletByPrivateKey(wallet.privateKey);
  const aelf = new AElf(new AElf.providers.HttpProvider(rpcUrlTDVW));
  if (!CONTRACT_INSTANCE_MAP[address]) {
    CONTRACT_INSTANCE_MAP[address] = await aelf.chain.contractAt(address, fakeWallet);
  }
  return CONTRACT_INSTANCE_MAP[address];
}

export const deferStartTime = 1000 * 60 * 5;
