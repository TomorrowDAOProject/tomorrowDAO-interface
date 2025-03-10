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
// -------------------------------------isDepositor-----------------------------
interface IDepositorRes {
  code: string;
  data: boolean;
}
// -------------------------------------get dao treasury address-----------------------------
interface IDAOTreasuryRes {
  code: string;
  data: string;
}
// -------------------------------------Add Comment-----------------------------
interface IAddCommentReq {
  proposalId?: string;
  alias?: string;
  chainId: string;
  comment: string;
  parentId?: string;
}
interface ICommentListsItem {
  id: string;
  chainId: string;
  daoId: string;
  proposalId: string;
  commenter: string;
  comment: string;
  parentId: string;
  commentStatus: string;
  createTime: number;
  modificationTime: number;
}
interface IAddCommentRes {
  code: string;
  data: {
    success: string;
    reason: string;
    comment: ICommentListsItem;
  };
  message: string;
}
// -------------------------------------Comment List-----------------------------
interface ICommentListsReq {
  chainId: string;
  proposalId?: string;
  alias?: string;
  skipCount?: number;
  skipId?: string;
  maxResultCount: number;
}
interface ICommentListsItem {
  id: string;
  chainId: string;
  daoId: string;
  proposalId: string;
  commenter: string;
  comment: string;
  parentId: string;
  commentStatus: string;
  createTime: number;
  modificationTime: number;
  commenterPhoto: string;
}
interface ICommentListsRes {
  code: string;
  data: {
    totalCount: number;
    items: Array<ICommentListsItem>;
    hasMore: boolean;
  };
  message: string;
}
// -------------------------------------URL info -----------------------------
interface IURLInfoRes {
  code: number;
  data?: {
    description: string;
    title: string;
    favicon: string;
  };
}
// -------------------------------------dao-list-----------------------------
interface IListDaoReq {
  skipCount: number; //  0
  maxResultCount: number; // 6
  chainId: string; // aelf/ tdvv
  daoType: 0 | 1;
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
  verifiedType: 'Blue' | 'Gold';
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
// -------------------------------------dao-list-----------------------------
interface ITreasuryAssetsReq {
  maxResultCount: number;
  skipCount: number;
  daoId?: string;
  alias?: string;
  chainId: string;
}
interface ITreasuryAssetsResponseDataItem {
  chainId: string;
  symbol: string;
  amount: number;
  decimal: number;
  usdValue: number;
}
interface ITreasuryAssetsResponseData {
  daoId: string;
  treasuryAddress: string;
  data: ITreasuryAssetsResponseDataItem[];
  totalCount: number;
}
interface ITreasuryAssetsResponse {
  code: string;
  data: ITreasuryAssetsResponseData;
  message: string;
}
// -------------------------------------dao-is exist some members-----------------------------
interface IDaoExistMembersRes {
  code: string;
  data: boolean;
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
  ChainId: string;
  SkipCount: number;
  MaxResultCount: number;
}
// ------------------------------------- token issue -----------------------------
interface ITokenIssueRes {
  code: number;
  data: {
    tokenOrigin: 1 | 2;
    totalSupply: number;
    supply: number;
    decimals: number;
    issueChainId: string;
    issued: string;
    proxyAccountHash: string;
    proxyAccountContractAddress: string;
    tokenContractAddress: string;
    realIssuers: string[];
  };
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
      Github?: string;
      Others?: string;
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
  alias: string;
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
  alias?: string;
  daoId?: string;
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
  isContract?: number;
  pageNum?: number;
  pageSize?: number;
  proposalType?: string;
  search?: string;
  status?: string;
  chainId: string;
  alias: string;
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
  alias: string;
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
  executeTime: string;
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
  address?: string;
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
  daoId: string;
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
  canExecute: boolean;
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
  daoId?: string;
  chainId: string;
  skipCount: number;
  maxResultCount: number;
  address?: string;
  proposalId?: string;
  voteOption?: string;
  source?: string;
}
interface IVoteHistoryItem {
  timeStamp: number;
  proposalId: string;
  proposalTitle: string;
  myOption: number;
  voter: string;
  voteNum: number;
  voteNumAfterDecimals: number;
  transactionId: string;
  executer: string;
  points?: number;
  voteFor?: string;
}

interface IVoteHistoryResData {
  totalCount: number;
  totalPoints: number;
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
// ------------------- new api treasury-records ---------------------------------
interface ITreasuryRecord {
  id: string;
  chainId: string;
  blockHeight: number;
  daoId: string;
  treasuryAddress: string;
  amount: number;
  symbol: string;
  amountAfterDecimals: number;
  executor: string;
  fromAddress: string;
  toAddress: string;
  memo: null | string;
  treasuryRecordType: number;
  createTime: string;
  proposalId: null | string;
  transactionId: string;
}
interface ITreasuryRecordRes {
  code: string;
  data: {
    data: ITreasuryRecord[];
    totalCount: number;
  };
  message: string;
}

// ------- vote option save ---------

enum ESourceType {
  Telegram = 0,
  TomorrowDao = 1,
}

interface ISaveAppItem {
  title: string;
  icon?: string;
  description?: string;
  longDescription?: string;
  screenshots?: string[];
  url?: string;
  categories?: string[];
  sourceType: ESourceType;
}

interface ISaveAppListReq {
  chainId: string;
  apps: ISaveAppItem[];
}

interface ISaveAppListRes {
  code: string;
  data: string[];
  message: string;
}

// -------------------  vote-options ---------------------------------
interface IUploadFileRes {
  code: string;
  data: string;
  message: string;
}
