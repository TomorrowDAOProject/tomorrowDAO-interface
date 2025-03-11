/**
 * @file organization actions
 * @author atom-yang
 */
import { fetchNetworkDaoProposalList } from 'api/request';
// import { request } from '../../common/request';
// import { API_PATH } from '../common/constants';
import { arrayToMap } from '../common/utils';
import getChainIdQuery from 'utils/url';

export const GET_PROPOSALS_LIST = arrayToMap([
  'GET_PROPOSALS_LIST_START',
  'GET_PROPOSALS_LIST_SUCCESS',
  'GET_PROPOSALS_LIST_FAIL',
]);

const statusList = {
  'all': 0,
  'pending': 1,
  'approved': 2,
  'released': 3,
  'expired': 4
}
const proposalTypeList = {
  'All': 0,
  'Parliament': 1,
  'Association':2,
  'Referendum': 3
}

export const getProposals = (params) => async (dispatch) => {
  dispatch({
    type: GET_PROPOSALS_LIST.GET_PROPOSALS_LIST_START,
    payload: params,
  });
  try {
    // todo 1. get proposal list
    // const searchParams = qs.parse(window.location.search);
    const chain = getChainIdQuery();
    const result = await fetchNetworkDaoProposalList({
      ...params,
      isContract: Boolean(params.isContract),
      chainId: chain.chainId,
      skipCount: params.pageNum - 1,
      maxResultCount: params.pageSize,
      status: statusList[params.status],
      proposalType: proposalTypeList[params.proposalType]
    });


    result.data.list = result.data.items.map(item=>{
      item.status = item.status.toLowerCase()
      return item
    })

    result.data.total = result.data.totalCount


    dispatch({
      type: GET_PROPOSALS_LIST.GET_PROPOSALS_LIST_SUCCESS,
      payload: result.data,
    });
  } catch (e) {
    dispatch({
      type: GET_PROPOSALS_LIST.GET_PROPOSALS_LIST_FAIL,
      payload: {},
    });
  }
};
