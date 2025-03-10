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
      skipCount: params.pageNum,
      maxResultCount: params.pageSize
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
