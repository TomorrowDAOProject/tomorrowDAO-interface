/**
 * @file get all tokens
 * @author atom-yang
 */
import {
  get,
} from '../utils';
import BigNumber from 'bignumber.js';

let tokens = [];
let lastTimestamp = new Date().valueOf();
const TIME_EXPIRED = 10 * 60 * 1000;

export default async function getAllTokens() {
  const now = new Date().valueOf();
  if (tokens.length === 0 || lastTimestamp < now - TIME_EXPIRED) {
    let results;
    try {
      results = await get('/app/token/list', {
        skipCount: 0,
        maxResultCount: 10000,
      });
      const list = results?.data?.list || [];
      if (!list || list.length === 0) {
        list = [
          {
            symbol: 'ELF',
            decimals: 8,
          },
        ];
      }
      const tempTokenList = list.map(item => ({
        symbol: item?.token?.symbol,
        decimals: item?.token?.decimals,
        supply: BigNumber(item?.circulatingSupply).times(10 ** item?.token?.decimals).toString(),
        totalSupply: String(item?.totalSupply),
      }));
      results = tempTokenList;
    } catch (e) {
      results = [
        {
          symbol: 'ELF',
          decimals: 8,
        },
      ];
    }
    tokens = [...results];
    lastTimestamp = now;
  }
  return tokens;
}
