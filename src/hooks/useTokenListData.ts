import { explorerServer } from 'api/axios';
import { useRequest } from 'ahooks';
import { fetchTokenPrice, fetchAddressTokenList } from 'api/request';
import { treasuryAccountAddress } from 'config';
import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
export interface ITokenListItem extends AddressTokenListDataItem {
  price?: number;
  valueUSD?: BigNumber;
}
export default function useTokenListData() {
  const {
    data: tokenListData,
    error: tokenListError,
    loading: tokenListLoading,
  } = useRequest(() => {
    return fetchAddressTokenList({
      address: treasuryAccountAddress,
    });
  });
  const tokens = useMemo(() => {
    return tokenListData?.data.map((item) => item.symbol);
  }, [tokenListData]);
  const {
    data: tokenPriceData,
    error: tokenPriceError,
    loading: tokenPriceLoading,
  } = useRequest(async () => {
    const res: Record<string, number> = {};
    if (!tokens) {
      return res;
    }
    const reqArr = tokens.map((token) => {
      return fetchTokenPrice({
        fsym: token,
      });
    });
    const resArr = await Promise.all(reqArr);
    for (const priceItem of resArr) {
      if (priceItem.USD) {
        res[priceItem.symbol] = priceItem.USD;
      }
    }
    return res;
  });
  const tokenList: ITokenListItem[] = (tokenListData?.data ?? []).map((item) => {
    return {
      ...item,
      price: tokenPriceData?.[item.symbol],
      valueUSD: tokenPriceData?.[item.symbol]
        ? new BigNumber(item.balance)
            .multipliedBy(tokenPriceData[item.symbol])
            .dp(8, BigNumber.ROUND_DOWN)
        : undefined,
    };
  });
  return {
    tokenPriceData,
    tokenList: tokenList,
    tokenListLoading,
    tokenListError,
  };
}
