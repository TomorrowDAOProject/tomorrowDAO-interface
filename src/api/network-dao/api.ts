import { apiServer } from '../axios';

export const fetchNetworkDaoProposalList = async (params: any): Promise<any> => {
  return apiServer.get('/networkdao/proposal/list', {
    params,
  });
};

export const fetchNetworkDaoProposaDetail = async (params: any): Promise<any> => {
  return apiServer.get('/networkdao/proposal/detail', {
    params,
  });
};
