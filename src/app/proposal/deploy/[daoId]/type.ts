export enum ProposalType {
  UNSPECIFIED = 0,
  GOVERNANCE = 1,
  ADVISORY = 2,
  VETO = 3,
}
export interface IContractInfo {
  ContractAddress: string;
  ContractName: string;
  FunctionList: string[];
}

export enum EVoteMechanismNameType {
  UniqueVote = 'UNIQUE_VOTE',
  TokenBallot = 'TOKEN_BALLOT',
}

export interface VoteSchemeItem {
  VoteSchemeId: string;
  VoteMechanism: number;
  VoteMechanismName: EVoteMechanismNameType; // Unspecified UniqueVote TokenBallot
}

export interface VoteSchemeListRes {
  VoteSchemeList: VoteSchemeItem[];
}
export enum VoteSchemeId {
  Unspecified = 0,
  UniqueVote = 1, // 1a1v
  TokenBallot = 2, // 1t1v
}

interface GovernanceMechanism {
  governanceSchemeId: string;
  name: string;
}

export interface GovernanceMechanismList {
  chainId: string;
  governanceMechanismList: GovernanceMechanism[];
}

interface SocialMedia {
  twitter: string;
  facebook: string;
  discord: string;
  telegram: string;
  reddit: string;
}

interface FileInfo {
  name: string;
  cid: string;
  url: string;
}

interface Metadata {
  name: string;
  logoUrl: string;
  description: string;
  socialMedia: SocialMedia;
}

export interface DaoInfo {
  chainId: string;
  daoId: string;
  metadata: Metadata;
  creator: string;
  governanceToken: string;
  governanceModel: string;
  memberCount: number;
  candidateCount: number;
  treasuryContractAddress: string;
  voteContractAddress: string;
  electionContractAddress: string;
  governanceContractAddress: string;
  timelockContractAddress: string;
  fileInfoList: FileInfo[];
  proposalTimePeriodSet: {
    activeTimePeriod: number;
    vetoActiveTimePeriod: number;
    pendingTimePeriod: number;
    executeTimePeriod: number;
    vetoExecuteTimePeriod: number;
  };
}

interface ContractInfoItem {
  ContractAddress: string;
  ContractName: string;
  FunctionList: string[];
}

export interface ContractInfo {
  contractInfoList: ContractInfoItem[];
}

export type TContractInfoList = IContractInfo[];
