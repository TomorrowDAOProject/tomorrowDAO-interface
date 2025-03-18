import { apiServer } from '../axios';

export const fetchNetworkDaoProposalList = async (params: any): Promise<any> => {
  return apiServer.get('/networkdao/proposals', {
    ...params,
  });
};

export const fetchNetworkDaoProposaDetail = async (params: any): Promise<any> => {
  return apiServer.get('/networkdao/proposal/info', {
    ...params,
  });
};
