import { apiServer } from '../axios';

const transferUrl = '/token/transfer';
const rankingVoteUrl = '/ranking/vote';
const rankingVoteStatusUrl = '/ranking/vote/status';
const rankListUrl = '/ranking/detail';
const voteLikeUrl = '/ranking/like';
const rankPointsUrl = '/user/my-points';
const taskListsUrl = '/user/task-list';
const completeTaskUrl = '/user/complete-task';
const referrelCodeUrl = '/referral/get-link';
const referrelInviteDetailUrl = '/referral/invite-detail';
const referrelInviteLeaderBoardUrl = '/referral/invite-leader-board';
const referrelInviteConfigUrl = '/referral/config';
const referralBindingStatusUrl = '/referral/referral-binding-status';
const reportSourceUrl = '/user/user-source-report';

const discoverAppListUrl = '/discover/app-list';
const discoverViewUrl = '/discover/view';
const discoverConfirmChooseUrl = '/discover/choose';
const discoverViewAp = '/discover/view-app';

const rankingsUrl = '/ranking/list';
const rankingBannerInfo = '/ranking/banner-info';
const viewAppUrl = '/user/view-ad';
const saveTgInfo = '/user/save-tg-info';

export const nftTokenTransfer = async (
  params: INftTokenTransfer,
): Promise<INftTokenTransferRes> => {
  return apiServer.post(transferUrl, {
    ...params,
  });
};

export const nftTokenTransferStatus = async (
  params: INftTokenTransferStatusReq,
): Promise<INftTokenTransferStatusRes> => {
  return apiServer.post('/token/transfer/status', {
    ...params,
  });
};

export const getRankingDetail = async (params: IRankingListReq): Promise<IRankingListRes> => {
  return apiServer.get(rankListUrl, {
    ...params,
  });
};

export const rankingVote = async (params: IRankingVoteReq): Promise<IRankingVoteRes> => {
  return apiServer.post(rankingVoteUrl, {
    ...params,
  });
};

export const fetchRankingVoteStatus = async (
  params: IRankingVoteStatusReq,
): Promise<IRankingVoteStatusRes> => {
  return apiServer.post(rankingVoteStatusUrl, {
    ...params,
  });
};
export const rankingVoteLike = async (
  params: IRankingVoteLikeReq,
): Promise<IRankingVoteLikeRes> => {
  return apiServer.post(voteLikeUrl, {
    ...params,
  });
};

export const getReferrelCode = async (params: IReferrelCodeReq): Promise<IReferrelCodeRes> => {
  return apiServer.post(referrelCodeUrl, {
    ...params,
  });
};
export const getReferrelConfig = async (params: {
  chainId?: string;
}): Promise<IReferrelConfigRes> => {
  return apiServer.get(referrelInviteConfigUrl, {
    ...params,
  });
};

export const getReferrelList = async (
  params?: IGetReferrelListReq,
): Promise<InviterListResponse> => {
  return apiServer.get(referrelInviteLeaderBoardUrl, {
    ...params,
  });
};
export const getInviteDetail = async (
  params: IGetInviteDetailReq,
): Promise<IGetInviteDetailResponse> => {
  return apiServer.get(referrelInviteDetailUrl, {
    ...params,
  });
};

export const getReferralBindingStatus = async (params: {
  chainId?: string;
}): Promise<IReferralBindingStatusRes> => {
  return apiServer.get(referralBindingStatusUrl, {
    ...params,
  });
};
export const reportUserSource = async (params: {
  chainId: string;
  source: string;
}): Promise<any> => {
  return apiServer.get(reportSourceUrl, {
    ...params,
  });
};
export const getRankPoints = async (params: {
  chainId: string;
  skipCount: number;
  maxResultCount: number;
}): Promise<IGetRankPointsRes> => {
  return apiServer.get(rankPointsUrl, {
    ...params,
  });
};
export const getTaskList = async (params: { chainId: string }): Promise<IGetTaskListRes> => {
  return apiServer.get(taskListsUrl, {
    ...params,
  });
};
export const completeTaskItem = async (params: {
  chainId: string;
  userTask: string;
  userTaskDetail: string;
}): Promise<ICompleteTaskItemRes> => {
  return apiServer.get(completeTaskUrl, {
    ...params,
  });
};
export const getDiscoverAppList = async (params: {
  chainId: string;
  category: string;
  skipCount: number;
  maxResultCount: number;
  aliases?: string[];
}): Promise<IGetDiscoverAppListRes> => {
  return apiServer.post(discoverAppListUrl, {
    ...params,
  });
};
export const getDiscoverAppView = async (params: {
  chainId: string;
}): Promise<IGetDiscoverAppViewRes> => {
  return apiServer.get(discoverViewUrl, {
    ...params,
  });
};

export const discoverConfirmChoose = async (params: {
  chainId: string;
  choices: string[];
}): Promise<IDiscoverConfirmChooseRes> => {
  return apiServer.post(discoverConfirmChooseUrl, {
    ...params,
  });
};

export const getRankings = async (params: {
  chainId: string;
  skipCount: number;
  type: number;
  maxResultCount: number;
}): Promise<IRankingsRes> => {
  return apiServer.get(rankingsUrl, {
    ...params,
  });
};

export const getRankingBannerInfo = async (params: {
  chainId: string;
}): Promise<IRankingBannerInfoRes> => {
  return apiServer.get(rankingBannerInfo, {
    ...params,
  });
};

export const updateViewApp = async (params: {
  chainId: string;
  aliases: string[];
}): Promise<IDiscoverConfirmChooseRes> => {
  return apiServer.post(discoverViewAp, {
    ...params,
  });
};

export const updateAdsView = async (params: {
  chainId: string;
  signature: string;
  timestamp: number;
}): Promise<IUpdateAdsViewRes> => {
  return apiServer.post(viewAppUrl, {
    ...params,
  });
};

export const updateTGInfo = async (params: {
  chainId: string;
  firstName: string;
  lastName: string;
  userName: string;
  icon: string;
}): Promise<IUpdateTgInfo> => {
  return apiServer.post(saveTgInfo, {
    ...params,
  });
};

export const telegramNeedAuthList = [
  transferUrl,
  rankingVoteUrl,
  rankingVoteStatusUrl,
  rankListUrl,
  voteLikeUrl,
  referrelCodeUrl,
  referrelInviteDetailUrl,
  referrelInviteLeaderBoardUrl,
  referrelInviteConfigUrl,
  referralBindingStatusUrl,
  reportSourceUrl,
  rankPointsUrl,
  taskListsUrl,
  completeTaskUrl,
  discoverAppListUrl,
  discoverViewUrl,
  discoverConfirmChooseUrl,
  rankingsUrl,
  rankingBannerInfo,
  discoverViewAp,
  viewAppUrl,
  saveTgInfo,
];
