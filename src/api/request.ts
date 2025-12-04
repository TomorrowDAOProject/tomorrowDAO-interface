import { stringify } from 'query-string';
import { apiServer, explorerServer, tokenServer } from './axios';
import { EDaoGovernanceMechanism } from 'app/(createADao)/create/type';
import { tokenIssueUrl, voteOptionSaveUrl, fileUploadUrl } from './url/tmrw';
import { curChain } from 'config';
export * from './api-wrap/telegram';

export * from './network-dao/api';

export const fetchToken = async (data: ITokenParams) => {
  return tokenServer.post<string, ITokenRes>('/connect/token', stringify(data), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};
export const fetchDaoList = async (params: IListDaoReq): Promise<IListDaoRes> => {
  return apiServer.get('/dao/dao-list', {
    ...params,
  });
};

export const fetchMyDaoList = async (
  params: IMyDaoListQueryParams,
): Promise<IMyDaoListResponse> => {
  return apiServer.get('/dao/my-dao-list', {
    ...params,
  });
};

export const fetchDaoInfo = async (params: IDaoInfoReq): Promise<IDaoInfoRes> => {
  return apiServer.get('/dao/dao-info', {
    ...params,
  });
};
export const fetchDaoMembers = async (
  params: IDaoMembersRequestParams,
): Promise<IDaoMembersResponse> => {
  return apiServer.get('/dao/member-list', {
    ...params,
  });
};
export const fetchHcMembers = async (
  params: IDaoHCMembersRequestParams,
): Promise<IDaoHCMembersResponse> => {
  return apiServer.post('/council/members', {
    ...params,
  });
};

export const fetchProposalList = async (params: IProposalListReq): Promise<IProposalListRes> => {
  return apiServer.post('/proposal/list', {
    ...params,
  });
};
// need auth
export const fetchProposalMyInfo = async (
  params: IProposalMyInfoReq,
): Promise<IProposalMyInfoRes> => {
  return apiServer.get('/proposal/my-info', {
    ...params,
  });
};

export const fetchProposalDetail = async (
  params: IProposalDetailReq,
): Promise<IProposalDetailRes> => {
  return apiServer.get('/proposal/detail', {
    ...params,
  });
};

export const fetchGovernanceMechanismList = async (params: {
  chainId: string;
  daoId: string;
}): Promise<IGovernanceModelListRes> => {
  return apiServer.get('/governance/list', {
    ...params,
  });
};

export const fetchContractInfo = async (params: {
  chainId: string;
  daoId: string;
  governanceMechanism?: EDaoGovernanceMechanism;
}): Promise<IContractInfoListRes> => {
  return apiServer.get('/contract/contracts-info', {
    ...params,
  });
};
export const fetchDaoExistMembers = async (params: {
  chainId: string;
  daoId: string;
  memberAddress: string;
}): Promise<IDaoExistMembersRes> => {
  return apiServer.get('/dao/is-member', {
    ...params,
  });
};
export const fetchVoteSchemeList = async (
  params: IVoteSchemeListReq,
): Promise<IVoteSchemeListRes> => {
  return apiServer.get('/vote/vote-scheme-list', {
    ...params,
  });
};
// is Depositor
export const isDepositor = async (params: {
  chainId: string;
  treasuryAddress: string;
  address: string;
  governanceToken: string;
}): Promise<IDepositorRes> => {
  return apiServer.post('/treasury/is-depositor', {
    ...params,
  });
};
// get dao treasury
export const getDaoTreasury = async (params: {
  chainId: string;
  alias: string;
}): Promise<IDAOTreasuryRes> => {
  return apiServer.get('/treasury/address', {
    ...params,
  });
};

// add comment
export const addCommentReq = async (params: IAddCommentReq): Promise<IAddCommentRes> => {
  return apiServer.post('/discussion/new-comment', {
    ...params,
  });
};

// get comment list
export const getCommentLists = async (params: ICommentListsReq): Promise<ICommentListsRes> => {
  return apiServer.get('/discussion/comment-list', {
    ...params,
  });
};
export const fetchURLDescription = async (params: {
  chainId: string;
  proposalId: string;
  forumUrl: string;
}): Promise<IURLInfoRes> => {
  return apiServer.post('/forum/link-preview', {
    ...params,
  });
};

// need auth
export const fetchVoteHistory = async (params: IVoteHistoryReq): Promise<IVoteHistoryRes> => {
  return apiServer.get('/proposal/vote-history', {
    ...params,
  });
};

export const fetchTokenInfo = async (params: {
  symbol: string;
  chainId: string;
}): Promise<ITokenInfoRes> => {
  return apiServer.get('/token', {
    ...params,
  });
};
export const fetchExecutableList = async (
  params: IExecutableListReq,
): Promise<IExecutableListRes> => {
  return apiServer.get('/proposal/executable-list', {
    ...params,
  });
};
export const fetchAddressTokenList = async (
  params: ITreasuryAssetsReq,
): Promise<ITreasuryAssetsResponse> => {
  return apiServer.post('/treasury/assets', {
    ...params,
  });
};

// explore
// get balance by address explore api
export const fetchAddressTransferList = async (
  params: IAddressTransferListReq,
  currentChain?: string,
): Promise<IAddressTransferListRes> => {
  const prefix = currentChain ? '/side-explorer-api' : '/explorer-api';
  return explorerServer.get(prefix + '/app/address/transfers', {
    params,
  });
};

export const fetchTreasuryAssets = async (
  params: ITreasuryAssetsReq,
): Promise<ITreasuryAssetsRes> => {
  return apiServer.get('/treasury/assets', {
    ...params,
  });
};
export const fetchTreasuryRecords = async (params: {
  ChainId: string;
  TreasuryAddress: string;
}): Promise<ITreasuryRecordRes> => {
  return apiServer.get('/treasury/records', {
    ...params,
  });
};

export const fetchTokenIssue = async (params: {
  symbol: string;
  chainId: string;
}): Promise<ITokenIssueRes> => {
  return apiServer.post(tokenIssueUrl, {
    ...params,
  });
};

export const saveVoteOptions = async (params: ISaveAppListReq): Promise<ISaveAppListRes> => {
  return apiServer.post(voteOptionSaveUrl, {
    ...params,
  });
};

export const fileUplaod = async (params: { file: File }): Promise<IUploadFileRes> => {
  const formData = new FormData();
  formData.append('chainId', curChain);
  formData.append('file', params.file);
  return apiServer.post(fileUploadUrl, formData);
};

export const getAddress = (address: string) => {
  if (!address) return '';
  const match = address.match(/(?:ELF_)?(.+?)(?:_[^_]+)?$/);
  const substring = match ? match[1] : '';
  return substring;
};
export async function fetchContractName(
  params: IContractHistoryRequestParams,
  isSideChain: boolean,
): Promise<IContractSourceCode> {
  const prefix = isSideChain ? '/side-explorer-api' : '/explorer-api';
  const result = await explorerServer.get(prefix + '/app/address/contract/file', { params });
  return result as IContractSourceCode;
}
