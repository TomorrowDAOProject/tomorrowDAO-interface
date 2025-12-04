import { useRequest } from 'ahooks';
import { fetchAddressTokenList } from 'api/request';
import { useEffect, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { curChain } from 'config';
export interface ITokenListItem extends IAddressTokenListDataItem {
  price?: number;
  valueUSD?: BigNumber | number;
}
interface IParams {
  daoId?: string;
  alias?: string;
  currentChain?: string;
}
export default function useTokenListData(params: IParams) {
  const { daoId, currentChain, alias } = params;
  const {
    data: tokenListData,
    error: tokenListError,
    loading: tokenListLoading,
    run,
  } = useRequest(
    () => {
      const params: ITreasuryAssetsReq = {
        chainId: currentChain ?? curChain,
        maxResultCount: 1000,
        skipCount: 0,
      };
      if (daoId) {
        params.daoId = daoId;
      }
      if (alias) {
        params.alias = alias;
      }
      return fetchAddressTokenList(params);
    },
    {
      manual: true,
    },
  );
  useEffect(() => {
    if (daoId || alias) {
      run();
    }
  }, [daoId, alias, run]);
  const totalValueUSD = useMemo(() => {
    return tokenListData?.data?.data?.reduce((acc, item) => {
      return acc.plus(item.usdValue ?? 0);
    }, new BigNumber(0));
  }, [tokenListData]);
  return {
    tokenList: tokenListData?.data?.data ?? [],
    tokenListLoading,
    tokenListError,
    totalValueUSD: totalValueUSD?.toFormat(2, BigNumber.ROUND_FLOOR),
  };
}
