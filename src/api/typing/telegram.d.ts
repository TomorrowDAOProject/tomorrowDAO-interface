// ------------------- TokenTransfer -------------------
interface INftTokenTransfer {
  chainId: string;
  symbol: string;
}

interface INftTokenTransfer {
  chainId: string;
  symbol: string;
}

enum TransferStatus {
  UnsupportedToken = 0,
  AlreadyClaimed = 1,
  TransferInProgress = 2,
  TransferFailed = 9,
}
// ------------------- TransferStatus -------------------
interface INftTokenTransferStatusReq {
  chainId: string;
  address: string;
  symbol: string;
}
interface INftTokenTransferResData {
  status: TransferStatus;
}

interface INftTokenTransferRes {
  code: number;
  data: INftTokenTransferResData;
}
interface INftTokenTransferStatusResData {
  transactionId: string;
  claimTime: string;
  status: TransferStatus;
  isClaimedInSystem: boolean;
}
interface INftTokenTransferStatusRes {
  code: number;
  data: INftTokenTransferStatusResData;
}

// ------------------- RankingList -------------------
interface IRankingListReq {
  chainId: string;
  proposalId: string;
}
interface IRankingListResItem {
  id?: string;
  chainId?: string;
  daoId?: string;
  proposalId?: string;
  proposalTitle?: string;
  proposalDescription?: string;
  activeStartTime?: string;
  activeEndTime?: string;
  appId?: string;
  alias: string;
  title: string;
  icon?: string;
  description?: string;
  editorChoice?: boolean;
  deployTime?: string;
  voteAmount?: number;
  votePercent?: number;
  url?: string;
  longDescription?: string;
  screenshots?: Array<string>;
  pointsAmount?: number;
  pointsPercent?: number;
}
interface IRankingListResData {
  bannerUrl: string;
  canVoteAmount: number;
  endEpochTime: number;
  endTime: string;
  labelType: RANKING_LABEL_KEY;
  proposalTitle: string;
  rankingList: Array<IRankingListResItem>;
  rankingType: RANKING_TYPE_KEY;
  startEpochTime: number;
  startTime: string;
  totalVoteAmount: number;
  userTotalPoints: number;
}
interface IRankingListRes {
  code: string;
  data: IRankingListResData;
  message: string;
}

// ------------------- RankingVote -------------------

enum VoteStatus {
  NotVoted = 0,
  Voting = 1,
  Voted = 2,
  Failed = 9,
}
interface IRankingVoteReq {
  rawTransaction: string;
  chainId: string;
  trackId: string;
}
interface IRankingVoteRes {
  code: number;
  data: {
    status: VoteStatus;
  };
}

// ------------------- VoteLike -------------------
interface ILikeItem {
  likeAmount: number;
  alias: string;
}
interface IRankingVoteLikeReq {
  chainId: string;
  proposalId: string;
  likeList: ILikeItem[];
}
interface IRankingVoteLikeRes {
  code: number;
  data: number;
}
// ------------------- RankingVote status -------------------
interface IRankingVoteStatusReq {
  chainId: string;
  address: string;
  proposalId: string;
}
interface IRankingVoteStatusRes {
  code: number;
  data: {
    status: VoteStatus;
    totalPoints: number;
  };
}

// ------------------- RankingVote lists -------------------
interface IRankingVoteListsReq {
  chainId: string;
  proposalId?: string;
  skipCount: number;
  maxResultCount: number;
}
interface IRankingVoteListsResItem {
  proposalId: string;
  daoId: string;
  rankingDescription: string;
}
interface IRankingVoteListsRes {
  code: number;
  data: {
    totalCount: number;
    items: Array<IRankingVoteListsResItem>;
  };
}

// ------------------- ReferrelCode -------------------
interface IReferrelCodeReq {
  chainId: string;
  token: string;
}
interface IReferrelCodeRes {
  code: number;
  data: {
    referrelLink: string;
    referrelCode: string;
  };
}

// ------------------- ReferrelList -------------------
interface IGetReferrelListReq {
  startTime?: number;
  endTime?: number;
  chainId?: string;
}
interface IInviterInfo {
  rank: number;
  inviter: string;
  inviterCaHash: string;
  inviteAndVoteCount: number;
  firstName: string;
  lastName: string;
  userName: string;
  icon: string;
}

interface InviterListResponse {
  code: number;
  data: {
    data: IInviterInfo[];
    totalCount: number;
    me: IInviterInfo;
  };
}

// ------------------- ReferrelInviteDetail -------------------
interface IGetInviteDetailReq {
  chainId: string;
}
interface IRewardInfo {
  accountCreation: number;
  accountCreationAll: number;
  address: string;
  caHash: string;
  duringCycle: boolean;
  endTime: number;
  estimatedReward: number;
  estimatedRewardAll: number;
  startTime: number;
  votigramActivityVote: number;
  votigramActivityVoteAll: number;
  votigramVote: number;
  votigramVoteAll: number;
}
interface IGetInviteDetailResponse {
  code: number;
  data: IRewardInfo;
}

interface IReferrelConfigActiveTime {
  startTime: number;
  endTime: number;
}
interface IReferrelConfigRes {
  code: number;
  data: {
    config: IReferrelConfigActiveTime[];
  };
}

// ------------------- ReferralBindingStatus -------------------
interface IReferralBindingStatusRes {
  code: number;
  data: {
    bindingSuccess: boolean;
    needBinding: boolean;
  };
}
// ------------------
interface IGetRankPointsResItem {
  description: string;
  id: string;
  points: number;
  pointsTime: number;
  pointsType: string;
  title: string;
}
interface IGetRankPointsRes {
  code: number;
  data: {
    totalPoints: number;
    totalCount: number;
    items: Array<IGetRankPointsResItem>;
  };
}

// ------------------- task list -------------------
interface IUserTaskItemDetail {
  userTaskDetail: string;
  points: number;
  complete: boolean;
  completeCount: number;
  taskCount: number;
}

interface IGetTaskListResItem {
  totalCount: number;
  userTask: string;
  data: IUserTaskItemDetail[];
}
interface IGetTaskListRes {
  code: number;
  data: {
    taskList: IGetTaskListResItem[];
  };
}

// ------------------- complete task item -------------------
interface ICompleteTaskItemRes {
  code: string;
  data: boolean;
}

// ------------------- dis cover lists -------------------

interface IGetDiscoverAppListRes {
  code: string;
  data: {
    totalCount: number;
    data: IDiscoverAppItem[];
  };
}

interface IDiscoverAppItem {
  alias: string;
  appType: string;
  categories: string[];
  createTime: string; // Consider using Date instead of string for more precise typing
  creator: string;
  description: string;
  editorChoice: boolean;
  icon: string;
  id: string;
  loadTime: string; // Date could be used for better date handling
  longDescription: string;
  screenshots: string[]; // Array of image URLs
  title: string;
  totalPoints: number;
  updateTime: string; // Using Date could benefit future calculations
  url: string;
  viewed: boolean;
}

// ------------------- discover view -------------------
interface IGetDiscoverAppViewRes {
  code: string;
  data: boolean;
}

// ------------------- confirm choose -------------------
interface IDiscoverConfirmChooseRes {
  code: string;
  data: {
    success: boolean;
  };
}

interface IUpdateAdsViewRes {
  code: string;
  data: number;
}

interface IUpdateTgInfo {
  code: string;
  data: number;
}

// ------------------- Rankings -------------------
enum RankingTypeEnum {
  Official = 1,
  Community = 2,
}

enum RankingLabelEnum {
  None = 0,
  Gold = 1,
  Blue = 2,
}
interface IRankingsItem {
  active: boolean;
  activeEndEpochTime: number;
  activeEndTime: string;
  activeStartEpochTime: number;
  activeStartTime: string;
  bannerUrl: string;
  chainId: string;
  daoId: string;
  labelType: RANKING_LABEL_KEY;
  proposalDescription: string;
  proposalId: string;
  proposalTitle: string;
  rankingType: RANKING_TYPE_KEY;
  totalVoteAmount: number;
}
interface IRankingsRes {
  code: string;
  data: {
    totalCount: number;
    userTotalPoints: number;
    data: IRankingsItem[];
  };
}

interface IRankingBannerInfoRes {
  code: string;
  data: {
    notViewedNewAppCount: number;
    hasFire: boolean;
  };
}
