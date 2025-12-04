import { useEffect, useState } from 'react';
import { isSideChain } from 'utils/chain';
import getChainIdQuery from 'utils/url';

function useChainSelect() {
  const [chainIdQuery, setChainIdQuery] = useState<{ chainId?: string }>({});
  useEffect(() => {
    const chainIdQuery = getChainIdQuery();
    setChainIdQuery(chainIdQuery);
  }, []);
  return {
    isSideChain: isSideChain(chainIdQuery.chainId),
    isMainChain: !isSideChain(chainIdQuery.chainId),
  };
}
export { useChainSelect };
