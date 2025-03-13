import { isSideChain } from 'utils/chain';
import { networkType } from 'config';
import getChainIdQuery from 'utils/url';

const getExplorerRPC = () => {
  let explorerRPC = 'https://explorer.aelf.io/chain';
  const chainIdQuery = getChainIdQuery();
  if (networkType === 'TESTNET') {
    if (isSideChain(chainIdQuery.chainId)) {
      explorerRPC = 'https://tdvw-test-node.aelf.io'
      // 'https://explorer-test-side02.aelf.io/chain';
    } else {
      explorerRPC = 'https://aelf-test-node.aelf.io';

      //'https://explorer-test.aelf.io' 

    }
  } else if (networkType === 'MAINNET') {
    if (isSideChain(chainIdQuery.chainId)) {
      explorerRPC = 'https://tdvv-public-node.aelf.io'
      // 'https://tdvv-explorer.aelf.io/chain';
    } else {
      explorerRPC = 'https://aelf-public-node.aelf.io'
      // 'https://explorer.aelf.io/chain';
    }
  }
  return explorerRPC;
};
export default getExplorerRPC;
