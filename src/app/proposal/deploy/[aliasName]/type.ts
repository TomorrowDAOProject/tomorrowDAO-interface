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

interface ISocialMedia {
  twitter: string;
  facebook: string;
  discord: string;
  telegram: string;
  reddit: string;
}

interface IFileInfo {
  name: string;
  cid: string;
  url: string;
}

interface Metadata {
  name: string;
  logoUrl: string;
  description: string;
  socialMedia: ISocialMedia;
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
  fileInfoList: IFileInfo[];
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

export interface IContractInfo {
  contractInfoList: ContractInfoItem[];
}

export type TContractInfoList = IContractInfo[];
export interface IProposalSearchParams {
  tab: string;
}
export enum EProposalActionTabs {
  TREASURY = 'treasury',
  CUSTOM_ACTION = 'customAction',
  AddMultisigMembers = 'addMultisigMembers',
  DeleteMultisigMembers = 'deleteMultisigMembers',
  AddHcMembers = 'addHcMembers',
  DeleteHcMembers = 'deleteHcMembers',
}
