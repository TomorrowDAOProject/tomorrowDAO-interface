export interface Item {
  chainId: string;
  daoId: string;
  logo: string;
  name: string;
  description: string;
  creator: string;
  proposalsNum: number;
  symbol: string;
  symbolHoldersNum: number;
  votersNum: number;
}

export interface DaolistDataRes {
  totalCount: number;
  items: Item[];
}
