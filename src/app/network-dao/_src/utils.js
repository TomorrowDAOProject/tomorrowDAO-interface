/**
 * @file utils.js
 * @author huangzongzhe, longyue
 */
import {
  notification,
} from 'antd';
import { isSideChain } from 'utils/chain';
import getChainIdQuery from 'utils/url';
import getExplorerRPC from 'utils/getExplorerRPC';
import {
  create,
} from 'apisauce';
import AElf from 'aelf-sdk';
import dayjs from 'dayjs';
import Cookies from 'js-cookie';


// import apisauce from './utils/apisauce';
const explorerRPC = getExplorerRPC()
const api = create({
  baseURL: '',
});

const httpErrorHandler = (message, des) => notification.open({
  message,
  description: des,
});
api.addRequestTransform(request => {
  const chainIdQuery = getChainIdQuery();
  const isSide = isSideChain(chainIdQuery.chainId);
  const prefix = isSide ? '/side-explorer-api' : '/explorer-api';
  request.url = prefix + request.url;
})
api.addResponseTransform((res) => {
  if (res.ok) {
    if (res.data.code === /^2\d{2}$/) return res.data;
    // httpErrorHandler(res.problem, res.problem);
  }
});

const timeout = null;
const user = null;
const password = null;
const header = [{
  name: 'Accept',
  value: 'text/plain;v=1.0',
}];
// console.log('RPCSERVER', RPCSERVER);
const aelf = new AElf(new AElf.providers.HttpProvider(
  explorerRPC,
  60000,
  // user,
  // password,
  // header
));

const get = async (url, params, config) => {
  const res = await api.get(url, params, config);
  if (res.ok) {
    return res.data;
  }

  httpErrorHandler(res.problem, res.problem);
};

const post = async (url, data, config) => {
  // todo: handle the other case
  if (!config) { config = { headers: {} }; }

  const csrf = Cookies.get('csrfToken');
  config.headers['x-csrf-token'] = csrf;
  const res = await api.post(url, data, config);
  if (res.ok) {
    return res.data;
  }

  httpErrorHandler(res.problem, res.problem);
};

const format = (time, fmtStr = 'YYYY-MM-DD HH:mm:ss Z') => dayjs(time).format(fmtStr);

const firstUpperCase = (inputString) => inputString.replace(inputString[0], inputString[0].toUpperCase());

/**
 * the style of the key of the result from the API are different
 * like: block_hash, tx_info, ExecutionState, SignatureState
 * format: block_hash -> BlockHash
 * @Param {string} inputString key
 * return {string}
 */
const formatKey = (inputString) => {
  const pieces = inputString.split('_');
  const piecesFormatted = pieces.map((item) => firstUpperCase(item));
  return piecesFormatted.join('').replace(/([A-Z])/g, ' $1').trim();
};

function transactionFormat(result) {
  const newTxs = {
    address_from: result.Transaction.From,
    address_to: result.Transaction.To,
    block_hash: result.BlockHash,
    block_height: result.BlockNumber,
    increment_id: result.Transaction.IncrementId || '',
    method: result.Transaction.MethodName,
    params: result.Transaction.Params,
    tx_id: result.TransactionId,
    tx_status: result.Status,
    tx_fee: result.fee,
    time: result.time,
  };
  return newTxs;
}

const transactionInfo = (hash) => aelf.chain.getTxResult(hash, { sync: true });

function isAElfAddress(address) {
  if (!address) {
    return false;
  }
  try {
    AElf.utils.decodeAddressRep(address);
    return true;
  } catch (e) {
    return false;
  }
}

function deduplicateByKey(arr, key) {
  if (!Array.isArray(arr)) {
    return [];
  }
  const seen = new Set();
  return arr.filter(item => {
    const val = item[key];
    if (seen.has(val)) {
      return false;
    } else {
      seen.add(val);
      return true;
    }
  });
}

export {
  get,
  post,
  aelf,
  format,
  formatKey,
  transactionFormat,
  transactionInfo,
  isAElfAddress,
  deduplicateByKey,
};
