/* eslint-disable no-restricted-globals */
/**
 * @file config.js
 * @author huangzongzhe
 */
import { networkType } from "config";
import { isSideChain } from "utils/chain";
import getExplorerRPC from 'utils/getExplorerRPC';
import getChainIdQuery from 'utils/url';
const chainIdQuery = getChainIdQuery();
const explorerRPC = getExplorerRPC();
let config = require("./config-testnet-aelf.json");
if (networkType === 'TESTNET') {
  if (isSideChain(chainIdQuery.chainId)) {
    config = require("./config-testnet-tdvw.json");
  } else {
    config = require("./config-testnet-aelf.json");
  }
} else if (networkType === 'MAINNET') {
  if (isSideChain(chainIdQuery.chainId)) {
    config = require("./config-mainnet-tdvv.json");
  } else {
    config = require("./config-mainnet-aelf.json");
  }
}

// the block chain URL this explorer is serving

const BUILD_ENDPOINT =
  process.argv[process.argv.indexOf("--CHAIN_ENDPOINT") + 1];
// const MAINCHAINID = "AELF";
// MAIN TESTNET
const NETWORK_TYPE = networkType === 'TESTNET' ? "TESTNET" : "MAIN";
// ChainId: AELF
// ChainId: tDVV(AElf public chain)
const CHAINS_LINK = {
  AELF: "https://testnet.aelfscan.io",
};
const CHAINS_LINK_NAMES = {
  AELF: "Main chain AELF",
};
const WALLET_DOMAIN = "https://wallet-test.aelf.io/";
const APPNAME = "explorer.aelf.io";
const commonPrivateKey =
  "0000000000000000000000000000000000000000000000000000000000000001";
const DEFAUTRPCSERVER = explorerRPC;

module.exports = {
  DEFAUTRPCSERVER,
  commonPrivateKey,
  // MAINCHAINID,
  NETWORK_TYPE,
  APPNAME,
  CHAINS_LINK,
  CHAINS_LINK_NAMES,
  // The following variable are with suitable name
  WALLET_DOMAIN,
  BUILD_ENDPOINT,
  ...config,
};
