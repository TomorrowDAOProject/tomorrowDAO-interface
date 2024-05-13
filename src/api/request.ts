import { apiServer, explorerServer } from './axios';

export const fetchDaoList = async (params: IListDaoReq): Promise<ListDaoRes> => {
  return apiServer.get('/dao/dao-list', {
    params,
  });
};

export const fetchDaoInfo = async (params: DaoInfoReq): Promise<DaoInfoRes> => {
  return apiServer.get('/dao/dao-info', {
    params,
  });
};

export const fetchProposalList = async (params: ProposalListReq): Promise<ProposalListRes> => {
  return apiServer.get('/proposal/list', {
    params,
  });
};

export const fetchProposalMyInfo = async (
  params: ProposalMyInfoReq,
): Promise<ProposalMyInfoRes> => {
  return apiServer.get('/proposal/my-info', {
    params,
  });
};

export const fetchProposalDetail = async (
  params: ProposalDetailReq,
): Promise<ProposalDetailRes> => {
  return apiServer.get('/proposal/detail', {
    params,
  });
};

export const fetchGovernanceMechanismList = async (params: {
  chainId: string;
  daoId: string;
}): Promise<GovernanceModelListRes> => {
  return apiServer.get('/governance/list', {
    params,
  });
};

export const fetchContractInfo = async (params: {
  chainId: string;
}): Promise<ContractInfoListRes> => {
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

// explore
export const fetchAddressTokenList = async (params: {
  address: string;
}): Promise<AddressTokenListRes> => {
  return explorerServer.get('/viewer/balances', {
    params,
  });
};

export const fetchAddressTransferList = async (params: {
  pageSize: number;
  pageNum: number;
  address: string;
}): Promise<AddressTransferListRes> => {
  return explorerServer.get('/viewer/transferList', {
    params,
  });
};
export const fetchTokenPrice = async (params: {
  fsym: string;
  syms?: string;
}): Promise<TokenPriceRes> => {
  if (!params.syms) {
    params.syms = 'USD';
  }

  return explorerServer.get('/token/price', {
    params,
  });
};
