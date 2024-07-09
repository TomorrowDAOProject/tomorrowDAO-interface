import { stringify } from 'query-string';
import { apiServer, explorerServer, tokenServer } from './axios';

export const fetchToken = async (data: ITokenParams) => {
  return tokenServer.post<string, ITokenRes>('/connect/token', stringify(data), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};
export const fetchDaoList = async (params: IListDaoReq): Promise<IListDaoRes> => {
  return apiServer.get('/dao/dao-list', {
    params,
  });
};

export const fetchMyDaoList = async (
  params: IMyDaoListQueryParams,
): Promise<IMyDaoListResponse> => {
  return apiServer.get('/dao/my-dao-list', {
    params,
  });
};

export const fetchDaoInfo = async (params: IDaoInfoReq): Promise<IDaoInfoRes> => {
  return apiServer.get('/dao/dao-info', {
    params,
  });
};
export const fetchDaoMembers = async (
  params: IDaoMembersRequestParams,
): Promise<IDaoMembersResponse> => {
  return apiServer.get('/dao/member-list', {
    params,
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
    params,
  });
};

export const fetchProposalDetail = async (
  params: IProposalDetailReq,
): Promise<IProposalDetailRes> => {
  return apiServer.get('/proposal/detail', {
    params,
  });
};

export const fetchGovernanceMechanismList = async (params: {
  chainId: string;
  daoId: string;
}): Promise<IGovernanceModelListRes> => {
  return apiServer.get('/governance/list', {
    params,
  });
};

export const fetchContractInfo = async (params: {
  chainId: string;
}): Promise<IContractInfoListRes> => {
  return apiServer.get('/contract/contracts-info', {
    params,
  });
};
export const fetchVoteSchemeList = async (
  params: IVoteSchemeListReq,
): Promise<IVoteSchemeListRes> => {
  return apiServer.get('/vote/vote-scheme-list', {
    params,
  });
};
// need auth
export const fetchVoteHistory = async (params: IVoteHistoryReq): Promise<IVoteHistoryRes> => {
  return apiServer.get('/proposal/vote-history', {
    params,
  });
};

export const fetchTokenInfo = async (params: {
  symbol: string;
  chainId: string;
}): Promise<ITokenInfoRes> => {
  return apiServer.get('/token', {
    params,
  });
};
export const fetchExecutableList = async (
  params: IExecutableListReq,
): Promise<IExecutableListRes> => {
  return apiServer.get('/proposal/executable-list', {
    params,
  });
};

// explore
export const fetchAddressTokenList = async (
  params: {
    address: string;
  },
  currentChain?: string,
): Promise<IAddressTokenListRes> => {
  const prefix = currentChain ? '/side-explorer-api' : '/explorer-api';
  return explorerServer.get(prefix + '/viewer/balances', {
    params,
  });
};

export const fetchAddressTransferList = async (
  params: IAddressTransferListReq,
  currentChain?: string,
): Promise<IAddressTransferListRes> => {
  const prefix = currentChain ? '/side-explorer-api' : '/explorer-api';
  return explorerServer.get(prefix + '/viewer/transferList', {
    params,
  });
};
export const fetchTokenPrice = async (
  params: {
    fsym: string;
    tsyms?: string;
  },
  currentChain?: string,
): Promise<ITokenPriceRes> => {
  if (!params.tsyms) {
    params.tsyms = 'USD';
  }
  const prefix = currentChain ? '/token-price-api' : '/token-price-api';

  return explorerServer.get(prefix + '/token/price', {
    params,
  });
};

export const fetchTreasuryAssets = async (
  params: ITreasuryAssetsReq,
): Promise<ITreasuryAssetsRes> => {
  return apiServer.get('/treasury/assets', {
    params,
  });
};
