declare type TUserInfoType = {
  address: string;
  fullAddress: string;
  name: string;
  profileImage: string;
  profileImageOriginal: string;
  bannerImage: string;
  email: string | null;
  twitter: string | null;
  instagram: string | null;
  [key: string]: string | null;
};

declare type TConfigItems = {
  networkType: 'TESTNET' | 'MAIN';
  curChain: Chain;
  connectServer?: string;
  connectUrl?: string;
  graphqlServer?: string;
  portkeyServer?: string;
  rpcUrlAELF?: string;
  rpcUrlTDVV?: string;
  rpcUrlTDVW?: string;
  daoAddress?: string;
  mainChainAddress?: string;
  sideChainAddress?: string;
  mainCaAddress?: string;
  sideCaAddress?: string;
  [key: string]: string;
};
