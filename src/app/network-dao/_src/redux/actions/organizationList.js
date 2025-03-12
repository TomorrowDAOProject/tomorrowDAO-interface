/**
 * @file organization actions
 * @author atom-yang
 */
import { apiServer } from 'api/axios';
import { API_PATH } from '../common/constants';
import { arrayToMap } from '../common/utils';

export const GET_ORGANIZATIONS_LIST = arrayToMap([
  'GET_ORGANIZATIONS_LIST_START',
  'GET_ORGANIZATIONS_LIST_SUCCESS',
  'GET_ORGANIZATIONS_LIST_FAIL',
]);

const changeProposalType = {
  'Parliament': 1,
  'Association': 2,
  'Referendum': 3
}

export const getOrganizations = (params) => async (dispatch) => {
  dispatch({
    type: GET_ORGANIZATIONS_LIST.GET_ORGANIZATIONS_LIST_START,
    payload: params,
  });
  try {
    const newParams = {
      chainId: params.chainId,
      search: params.search,
      maxResultCount: params.pageSize,
      skipCount: (params.pageNum - 1) * params.pageSize,
      proposalType: changeProposalType[params.proposalType]
    }
    const result = await apiServer.get(API_PATH.GET_ORGANIZATIONS, newParams);

    result.data.list = result.data.items.map(item => {
      item.leftOrgInfo = item.networkDaoOrgLeftOrgInfoDto
      return item
    })
    result.data.total = result.data.totalCount

    console.log('result.data', result.data)
    
    dispatch({
      type: GET_ORGANIZATIONS_LIST.GET_ORGANIZATIONS_LIST_SUCCESS,
      payload: result.data,
    });
  } catch (e) {
    dispatch({
      type: GET_ORGANIZATIONS_LIST.GET_ORGANIZATIONS_LIST_FAIL,
      payload: {},
    });
  }
};
