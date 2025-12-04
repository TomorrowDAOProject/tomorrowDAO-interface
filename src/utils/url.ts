import qs from 'query-string';

const getChainIdQuery: () => { chainId?: string; chainIdQueryString?: string } = () => {
  if (typeof window === 'undefined') {
    return {};
  }
  const searchParams = qs.parse(window.location.search);
  const chainId = searchParams.chainId as string;
  return {
    chainId: chainId ?? 'AELF',
    chainIdQueryString: chainId ? `chainId=${chainId}` : '',
  };
};
export const replaceUrlParams = (key: string, value: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set(key, value);
  window.history.replaceState({}, '', url.toString());
};

export default getChainIdQuery;
