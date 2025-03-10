/**
 * @file config
 * @author atom-yang
 */

import viewerInfo from '../config/viewer/config.js'

const { originQueriedConfig } = viewerInfo;
export default {
  ...originQueriedConfig,
  API_PATH: {
    GET_TRANSACTION_BY_ADDRESS: "/api/address/transactions",
    GET_ALL_CONTRACT_NAME: "/api/viewer/allContracts",
    GET_BALANCES_BY_ADDRESS: "/api/app/address/tokens",
    GET_ACCOUNT_LIST: "/api/viewer/accountList",
    GET_TOKEN_LIST: "/proposal/tokenList",
    GET_ALL_TOKENS: "/api/viewer/getAllTokens",
    GET_TOKENS_TRANSACTION: "/api/viewer/tokenTxList",
    GET_TOKEN_INFO: "/api/app/token/info",
    GET_EVENT_LIST: "/api/viewer/eventList",
    GET_TRANSFER_LIST: "/api/app/address/transfers",
  },
};
