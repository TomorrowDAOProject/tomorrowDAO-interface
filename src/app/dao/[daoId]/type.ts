import { IPaginationProps } from 'aelf-design';

export interface ISocialMedia {
  twitter: string;
  facebook: string;
  discrod: string;
  telegram: string;
  reddit: string;
}
export interface IMetadata {
  name: string;
  logoUrl: string;
  description: string;
  socialMedia: ISocialMedia;
}
export interface IFileInfo {
  name: string;
  cid: string;
  url: string;
}

export type TInfo = {
  symbol: 'ELF';
  availableUnStakeAmount: 1000;
  stakeAmount: string;
  votesAmount: string;
  canVote: true;
};

export enum HCType {
  MEMBER = 'Member',
  CANDIDATE = 'Candidate',
}

export enum TabKey {
  PROPOSALS = 'proposals',
  HC = 'highCouncil',
  MYINFO = 'myInfo',
}

export const enum ProposalStatus {
  ALL = 'All',
  ACTIVE = 'Active',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  ABSTAINED = 'Abstained',
  EXPIRED = 'Expired',
  EXECUTED = 'Executed',
}

export interface IProposalTableParams {
  pagination: IPaginationProps;
  // governanceMechanism?: string;
  proposalType?: string;
  proposalStatus?: string;
  content?: string;
}

export type TTableParamsKey = keyof IProposalTableParams;
