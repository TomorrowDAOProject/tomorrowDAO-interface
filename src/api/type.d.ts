interface ITokenParams {
  grant_type: string;
  scope: string;
  client_id: string;
  pubkey?: string;
  version?: string;
  signature?: string;
  timestamp?: number;
  source: string;
  ca_hash?: string;
}
interface ITokenRes {
  access_token: string;
  expires_in: number;
  token_type: string;
}
interface LocalJWTData extends ITokenRes {
  expiresTime?: number;
}
// -------------------------------------dao-list-----------------------------
interface IListDaoReq {
  skipCount: number; //  0
  maxResultCount: number; // 6
  chainId: string; // aelf/ tdvv
}

interface IDaoItem {
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
  isNetworkDAO?: boolean;
  highCouncilMemberCount: number;
  alias: string;
}

interface IDaoData {
  totalCount: number;
  items: IDaoItem[];
}

interface IListDaoRes {
  code: string;
  data: IDaoData;
  message: string;
}
// -------------------------------------my-dao-list----------------------
interface IMyDaoListDataItem {
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
  isNetworkDAO: boolean;
  logo: string;
  highCouncilMemberCount: number;
  alias?: string;
}

interface IMyDaoListData {
  type: number;
  list: IMyDaoListDataItem[];
  totalCount: number;
}

interface IMyDaoListResponse {
  code: string;
  data: IMyDaoListData[];
  message: string;
}

interface IMyDaoListQueryParams {
  Type: number;
  Address: string;
  ChainId: string;
  SkipCount: number;
  MaxResultCount: number;
}
// -------------------------------------dao-info-----------------------------
interface ISocialMedia {
  twitter: string;
  facebook: string;
  discrod: string;
  telegram: string;
  reddit: string;
}

interface IProposalTimePeriodSet {
  activeTimePeriod: number;
  vetoActiveTimePeriod: number;
  pendingTimePeriod: number;
  executeTimePeriod: number;
  vetoExecuteTimePeriod: number;
}

interface IFileInfo {
  file: {
    name: string;
    cid: string;
    url: string;
  };
  uploader: string;
  uploadTime: string;
}

interface IDaoInfoData {
  id: string;
  chainId: string;
  blockHeight: number;
  creator: string;
  metadata: {
    name: string;
    logoUrl: string;
    description: string;
    socialMedia: {
      Twitter?: string;
      Facebook?: string;
      Discord?: string;
      Telegram?: string;
      Reddit?: string;
    };
  };
  governanceMechanism: number;
  governanceToken: string;
  isHighCouncilEnabled: boolean;
  highCouncilAddress: null | string;
  memberCount?: number;
  candidateCount?: number;
  governanceSchemeThreshold: {
    proposalThreshold: number;
  };
  highCouncilConfig: null | {
    electionPeriod: number;
    maxHighCouncilCandidateCount: number;
    maxHighCouncilMemberCount: number;
    stakingAmount: number;
  };
  highCouncilTermNumber: number;
  fileInfoList: IFileInfo[];
  isTreasuryContractNeeded: boolean;
  subsistStatus: boolean;
  treasuryContractAddress: string;
  treasuryAccountAddress: null | string;
  isTreasuryPause: boolean;
  treasuryPauseExecutor: null | string;
  voteContractAddress: string;
  electionContractAddress: string;
  governanceContractAddress: string;
  timelockContractAddress: string;
  activeTimePeriod: number;
  vetoActiveTimePeriod: number;
  pendingTimePeriod: number;
  executeTimePeriod: number;
  vetoExecuteTimePeriod: number;
  createTime: string;
  isNetworkDAO: boolean;
  treasuryAddress?: string;
  highCouncilMemberCount?: number;
  alias?: string;
}

interface IDaoInfoReq {
  daoId?: string;
  chainId: string;
  alias?: string;
}

interface IDaoInfoRes {
  code: string;
  data: IDaoInfoData;
  message: string;
}
// -------------------------------------dao-members-----------------------------
interface IDaoMembersRequestParams {
  SkipCount: number;
  MaxResultCount: number;
  ChainId: string;
  DAOId: string;
}
interface IDaoMembersItem {
  id: string;
  chainId: string;
  blockHeight: number;
  daoId: string;
  address: string;
  createTime: string;
}

interface IDaoMembersData {
  data: IDaoMembersItem[];
  totalCount: number;
}

interface IDaoMembersResponse {
  code: string;
  data: IDaoMembersData;
  message: string;
}
// -------------------------------------dao-HC-members-----------------------------
interface IDaoHCMembersRequestParams {
  chainId: string;
  daoId: string;
}
type IDaoHCMembersData = string[];
interface IDaoHCMembersResponse {
  code: string;
  data: IDaoHCMembersData;
  message: string;
}
// -------------------------------------propal-list-----------------------------

interface IProposalListReq {
  skipCount?: number;
  maxResultCount?: number;
  chainId: string;
  daoId: string;
  // governanceMechanism: string;
  proposalType?: string;
  proposalStatus?: string;
  content?: string;
  pageInfo?: {
    previousPageInfo?: any;
    nextPageInfo?: any;
  };
  isNetworkDAO?: boolean;
}

interface IProposalMyInfoReq {
  chainId: string;
  daoId: string;
  proposalId?: string;
  address: string;
}

interface ITransaction {
  contractMethodName: string;
  toAddress: string;
  params: {
    param1: string;
    param2: string;
  };
}
interface IProposalsItem {
  activeEndTime: string;
  executeStartTime: string;
  executeEndTime: string;
  chainId: string;
  proposalId: string;
  deployTime: string;
  proposalTitle: string;
  governanceMechanism: string;
  proposalStatus: string;
  proposalStage: string;
  proposalDescription: string;
  proposalType: string;
  startTime: string;
  endTime: string;
  expiredTime: string;
  transaction: ITransaction;
  votesAmount: number;
  approvedCount: number;
  rejectionCount: number;
  abstentionCount: number;
  voterCount: number;
  minimalRequiredThreshold: number;
  minimalVoteThreshold: number;
  minimalApproveThreshold: number;
  maximalRejectionThreshold: number;
  maximalAbstentionThreshold: number;
  proposalSource?: number;
  voteMechanismName?: string;
}
interface IProposalListResData {
  totalCount: number;
  items: IProposalsItem[];
  previousPageInfo?: any;
  nextPageInfo?: any;
}

interface IProposalListRes {
  code: string;
  data: IProposalListResData;
  message: string;
}
interface IWithdrawListItem {
  proposalIdList: string[];
  withdrawAmount: number;
}
interface IProposalMyInfo {
  symbol: string;
  decimal: string;
  availableUnStakeAmount: number;
  stakeAmount: number;
  votesAmountTokenBallot: number;
  votesAmountUniqueVote: number;
  canVote: boolean;
  withdrawList: IWithdrawListItem[];
}

interface IProposalMyInfoRes {
  code: string;
  data: IProposalMyInfo;
  message: string;
}

// -------------------------------------propal-detail-----------------------------

interface IProposalDetailReq {
  proposalId: string;
  chainId: string;
}

interface IProposalLife {
  proposalStatus: string;
  proposalStage: string;
}

interface IProposalDetailDataTransaction {
  toAddress: string;
  contractMethodName: string;
  params: {
    param: string;
  };
}
interface IProposalDetailDataVoteTopListItem {
  amount: number;
  option: string;
  transactionId: string;
  voteTime: string;
  voter: string;
  votingItemId: string;
}
interface IProposalDetailData {
  alias: string;
  startTime: string;
  endTime: string;
  activeEndTime: string;
  executeStartTime: string;
  executeEndTime: string;
  expiredTime: string;
  decimals: string;
  proposalLifeList: IProposalLife[];
  voteTopList: IProposalDetailDataVoteTopListItem[];
  chainId: string;
  blockHeight: number;
  id: string;
  daoId: null | string;
  proposalId: string;
  proposalTitle: string;
  proposalDescription: string;
  forumUrl: string;
  proposalType: string;
  activeStartTime: string;
  activeEndTime: string;
  executeStartTime: string;
  executeEndTime: string;
  proposalStatus: string;
  proposalStage: string;
  proposer: string;
  schemeAddress: string;
  transaction: IProposalDetailDataTransaction;
  voteSchemeId: null | string;
  voteMechanismName: string;
  vetoProposalId: null | string;
  deployTime: string;
  executeTime: string;
  governanceMechanism: string;
  minimalRequiredThreshold: number;
  minimalVoteThreshold: number;
  minimalApproveThreshold: number;
  maximalRejectionThreshold: number;
  maximalAbstentionThreshold: number;
  activeTimePeriod: number;
  vetoActiveTimePeriod: number;
  pendingTimePeriod: number;
  executeTimePeriod: number;
  vetoExecuteTimePeriod: number;
  voterCount: number;
  votesAmount: number;
  approvedCount: number;
  rejectionCount: number;
  abstentionCount: number;
  proposalSource: number;
}

interface IProposalDetailRes {
  code: string;
  data: IProposalDetailData;
  message: string;
}
// -------------------------------------governance-model-list-----------------------------
interface ISchemeThreshold {
  minimalRequiredThreshold: number;
  minimalVoteThreshold: number;
  minimalApproveThreshold: number;
  maximalRejectionThreshold: number;
  maximalAbstentionThreshold: number;
}

interface IGovernanceScheme {
  id: string;
  daoId: string;
  schemeId: string;
  schemeAddress: string;
  chainId: string;
  governanceMechanism: string;
  governanceToken: string;
  schemeThreshold?: ISchemeThreshold;
}

type TGovernanceSchemeList = IGovernanceScheme[];
interface IGovernanceModelListData {
  data: TGovernanceSchemeList;
}
interface IGovernanceModelListRes {
  code: string;
  data: IGovernanceModelListData;
  message: string;
}
// -------------------------------------contracts-info-----------------------------

interface IContractInfo {
  contractAddress: string;
  contractName: string;
  functionList: string[];
}

interface IContractInfoListData {
  contractInfoList: IContractInfo[];
}

interface IContractInfoListRes {
  code: string;
  data: IContractInfoListData;
  message: string;
}
// -------------------------------------vote-scheme-list-----------------------------

interface IVoteSchemeListReq {
  chainId: string;
  daoId: string;
}

interface IVoteScheme {
  voteSchemeId: string;
  voteMechanismName: string;
  voteMechanism: number;
}

interface IVoteSchemeListData {
  voteSchemeList: IVoteScheme[];
}

interface IVoteSchemeListRes {
  code: string;
  data: IVoteSchemeListData;
  message: string;
}
// -------------------------------------token-info-----------------------------

interface ITokenInfoData {
  chainId?: string;
  decimals?: number;
  imageUrl?: string;
  isNFT?: boolean;
  name?: string;
  supply?: string;
  symbol?: string;
  totalSupply?: string;
}

interface ITokenInfoRes {
  msg: string;
  code: number;
  data: ITokenInfoData;
}

// -------------------------------------explore-----------------------------
interface IAddressTokenListDataItem {
  symbol: string;
  balance: string;
}

interface IAddressTokenListRes {
  msg: string;
  code: number;
  data: IAddressTokenListDataItem[];
}
// -------------------------------------explore-----------------------------
interface IAddressTransferListTxFee {
  ELF: number;
}

interface IAddressTransferListDataListItem {
  id: number;
  txId: string;
  from: string;
  to: string;
  amount: string;
  symbol: string;
  action: string;
  isCrossChain: string;
  relatedChainId: string;
  memo: null;
  txFee: IAddressTransferListTxFee;
  time: string;
  method: string;
  blockHeight: number;
  addressFrom: string;
  addressTo: string;
}

interface IAddressTransferListData {
  list: IAddressTransferListDataListItem[];
  total: number;
}
interface IAddressTransferListReq {
  pageSize: number;
  pageNum: number;
  address: string;
  isNft?: boolean;
}
interface IAddressTransferListRes {
  msg: string;
  code: number;
  data: IAddressTransferListData;
}
// -------------------------------------ITokenPriceRes-----------------------------
interface ITokenPriceRes {
  USD?: number;
  symbol: string;
}

// -------------------------------------vote-history-----------------------------
interface IVoteHistoryReq {
  daoId: string;
  chainId: string;
  skipCount: number;
  maxResultCount: number;
  address: string;
  voteOption?: string;
}
interface IVoteHistoryItem {
  timeStamp: number;
  proposalId: string;
  proposalTitle: string;
  myOption: number;
  votesNum: number;
  transactionId: string;
  executer: string;
}

interface IVoteHistoryResData {
  total: number;
  items: IVoteHistoryItem[];
}
interface IVoteHistoryRes {
  code: string;
  data: IVoteHistoryResData;
  message: string;
}

// -------------------  executable-list ---------------------------------
interface IExecutableListReq {
  skipCount: number;
  maxResultCount: number;
  chainId: string;
  daoId: string;
  proposer: string;
}
interface IExecutableListResData {
  totalCount: number;
  items: {
    chainId: string;
    proposalId: string;
    releaseAddress: string;
    deployTime: string;
    proposalTitle: string;
    governanceMechanism: string;
    proposalStatus: string;
    proposalDescription: string;
    proposalType: string;
    startTime: string;
    endTime: string;
    expiredTime: string;
    executeEndTime: string;
    transaction: {
      contractMethodName: string;
      toAddress: string;
      params: {
        param1: string;
        param2: string;
      };
    };
  }[];
}
interface IExecutableListRes {
  code: string;
  data: IExecutableListResData;
  message: string;
}
// -------------------  treasury-assets ---------------------------------
interface ITreasuryAssetsReq {
  chainId: string;
  daoId: string;
  symbols?: string[];
}
interface ITreasuryAssetsAsset {
  symbol: string;
  amount: number;
  decimal: number;
}

interface ITreasuryAssetsData {
  treasuryAddress: string;
  asserts: ITreasuryAssetsAsset[];
}

interface ITreasuryAssetsRes {
  code: number;
  data: ITreasuryAssetsData;
}
// -------------------  treasury-records ---------------------------------
interface ITreasuryRecordsReq {
  daoId: string;
  chainId: string;
  skipCount: number;
  maxResultCount: number;
}
