/* eslint-disable global-require */
import { isSideChain } from "utils/chain";
import { networkType } from "config";
import getChainIdQuery from 'utils/url';
const chainIdQuery = getChainIdQuery();

let originQueriedConfig = require('./config-testnet-aelf.json');
if (networkType === 'TESTNET') {
  if (isSideChain(chainIdQuery.chainId)) {
    originQueriedConfig = require("./config-testnet-tdvw.json");
  } else {
    originQueriedConfig = require("./config-testnet-aelf.json");
  }
} else if (networkType === 'MAINNET') {
  if (isSideChain(chainIdQuery.chainId)) {
    originQueriedConfig = require("./config-mainnet-tdvv.json");
  } else {
    originQueriedConfig = require("./config-mainnet-aelf.json");
  }
}


let config = {};

if (process.env.NODE_ENV === 'production') {
  config = require('./config.prod.json');
} else {
  config = require('./config.dev.json');
}

module.exports = {
  ...originQueriedConfig,
  ...config,
  originQueriedConfig
};
