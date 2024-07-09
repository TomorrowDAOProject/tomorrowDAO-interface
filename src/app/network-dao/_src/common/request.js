/**
 * @file
 * @author atom-yang
 */
import axios from 'axios';
import { isSideChain } from 'utils/chain';
import qs from 'query-string';
import { omitBy } from 'lodash/fp';
import { isObject } from 'lodash';

const defaultRequestOptions = {
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
  withCredentials: true,
  method: 'POST',
  baseURL: ''
};
const http = axios.create(defaultRequestOptions);

const needPurify = (rawData) => (isObject(rawData) && !Array.isArray(rawData));
const purify = (rawData) => (needPurify(rawData)
  ? omitBy((value) => value === null
    || value === undefined
    || value === '')(rawData)
  : rawData);

/**
 * @desc
 * @param response
 */
const handleInvalidError = ({ data }) => {
  if (+data.code === 0) {
    return data.data;
  }
  throw data;
  // todo: err handle
};

/**
 * @desc 
 * @param {Error} error
 */
const handleRequestError = (error) => {
  // todo: 
  throw error;
};

const makeRequestConfig = (url, params, { headers = {}, ...extraOptions }) => {
  const searchParams = qs.parse(window.location.search);
  const isSide = isSideChain(searchParams.chainId);
  const prefix = isSide ? '/side-explorer-api' : '/explorer-api';
  // console.log('window.location', url, window.location)
  url = prefix + url;
  const data = purify(params);
  const config = {
    ...defaultRequestOptions,
    headers,
    url,
    ...extraOptions,
  };

  if (config.method.toUpperCase() === 'GET') {
    config.params = data;
  } else if (config.method.toUpperCase() === 'POST') {
    config.data = data;
  } else {
    throw new Error(`don\'t support http method ${config.method.toUpperCase()}`);
  }

  return config;
};

/**
 * @param {string} url 
 * @param {Object} params 
 * @param {Object} extraOptions 
 */
export const request = (url, params, extraOptions = {}) => http.request(makeRequestConfig(url, params, extraOptions))
  .then((res) => handleInvalidError(res), handleRequestError);
