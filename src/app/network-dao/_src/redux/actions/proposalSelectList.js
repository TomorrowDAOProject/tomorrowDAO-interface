/**
 * @file organization actions
 * @author atom-yang
 */
import { API_PATH } from '../common/constants';
import { arrayToMap } from '../common/utils';
import { apiServer } from 'api/axios';
import getChainIdQuery from 'utils/url';

const chain = getChainIdQuery()

export const GET_PROPOSAL_SELECT_LIST = arrayToMap([
  'SET_PROPOSALS_SELECT_LIST_START',
  'SET_PROPOSALS_SELECT_LIST_SUCCESS',
  'SET_PROPOSALS_SELECT_LIST_FAIL',
  'DESTORY',
]);

const dispatchSelectList = ({ params, result }) => (dispatch) => {
  try {
    dispatch({
      type: GET_PROPOSAL_SELECT_LIST.SET_PROPOSALS_SELECT_LIST_START,
      payload: {
        params,
        list: result?.list ?? [],
        total: result?.total ?? 0,
        bpCount: result?.bpCount ?? 0,
      },
    });
  } catch (e) {
    dispatch({
      type: GET_PROPOSAL_SELECT_LIST.SET_PROPOSALS_LIST_FAIL,
      payload: {},
    });
  }
};

export const getProposalSelectListWrap = async (dispatch, params) => {
  const updataParams = {
    ...params,
    chainId: chain.chainId,
    isContract: Boolean(params.isContract)
  }
  const result = await apiServer.get(API_PATH.GET_PROPOSAL_LIST, updataParams);

  result.data.list = result.data.items
  result.data.total = result.data.totalCount

  const res = result.data

  dispatch(dispatchSelectList({ params, result: res } ));
  
  return true;
};

export const destorySelectList = () => (dispatch) => {
  dispatch(GET_PROPOSAL_SELECT_LIST.DESTORY);
};
