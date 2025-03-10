/**
 * @file organization actions
 * @author atom-yang
 */
import { apiServer } from 'api/axios';
import { request } from '../../common/request';
import { API_PATH } from '../common/constants';
import { arrayToMap } from '../common/utils';

export const GET_ORGANIZATIONS_LIST = arrayToMap([
  'GET_ORGANIZATIONS_LIST_START',
  'GET_ORGANIZATIONS_LIST_SUCCESS',
  'GET_ORGANIZATIONS_LIST_FAIL',
]);

export const getOrganizations = (params) => async (dispatch) => {
  dispatch({
    type: GET_ORGANIZATIONS_LIST.GET_ORGANIZATIONS_LIST_START,
    payload: params,
  });
  try {
    const result = await apiServer.get(API_PATH.GET_ORGANIZATIONS, params);

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
