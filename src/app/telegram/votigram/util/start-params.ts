import { TelegramPlatform } from '@portkey/did-ui-react';
import qs from 'query-string';
import { IStartAppParams } from '../type';
//
export const AND_CHAR = '_';
export const CONNECT_CHAR = '-';
export const stringifyStartAppParams = (params: IStartAppParams) => {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      parts.push(`${key}${AND_CHAR}${value}`);
    }
  }
  return parts.join(CONNECT_CHAR);
};

export const parseStartAppParams = (params: string): IStartAppParams => {
  const result: Record<string, string | number> = {};
  const parts = params.split(CONNECT_CHAR);

  for (const part of parts) {
    const [key, value] = part.split(AND_CHAR);
    if (key && value !== undefined) {
      result[key] = value;
    }
  }
  return result as IStartAppParams;
};

export const getReferrerCode = () => {
  const startParam = TelegramPlatform.getInitData()?.start_param ?? '';
  let referrerCode = '';
  if (startParam.includes(AND_CHAR)) {
    const params = parseStartAppParams(startParam);
    referrerCode = params.referralCode ?? '';
  } else {
    referrerCode = startParam;
  }
  if (!referrerCode && typeof window !== 'undefined') {
    const searchParams = qs.parse(window.location.search);
    referrerCode = (searchParams.referralCode as string) ?? '';
  }
  console.log('referrerCode is:', referrerCode, 'startParam is:', startParam);
  return referrerCode;
};