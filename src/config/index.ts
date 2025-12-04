export * from './testnet';
export * from './net-work-dao';
export enum WalletType {
  unknown = 'unknown',
  discover = 'discover',
  portkey = 'portkey',
}

export enum NetworkType {
  MAIN = 'MAIN',
  TESTNET = 'TESTNET',
}

export const SECONDS_60 = 60000;

export const ElectionContractName = 'Election';

export const NetworkDaoHomePathName = '/network-dao';
export const NetworkName = 'Network DAO';
export const NetworkDaoAlias = 'network-dao';
