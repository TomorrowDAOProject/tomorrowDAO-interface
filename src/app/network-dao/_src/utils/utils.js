/* eslint-disable import/no-cycle */
import AElf from "aelf-sdk";
import Decimal from "decimal.js";
import { aelf } from "../utils";
import config from "../../_src/config/config";
// import Root from '../protobuf/virtual_transaction.proto';

const resourceDecimals = config.resourceTokens.reduce(
  (acc, v) => ({
    ...acc,
    [v.symbol]: v.decimals,
  }),
  {}
);

export function isAddress(value) {
  if (/[\u4e00-\u9fa5]/.test(value)) return false;
  try {
    return !!AElf.utils.base58.decode(value);
  } catch {
    return false;
  }
}

export const rand16Num = (len = 0) => {
  const result = [];
  for (let i = 0; i < len; i += 1) {
    result.push("0123456789abcdef".charAt(Math.floor(Math.random() * 16)));
  }
  return result.join("");
};

export const removeAElfPrefix = (name) => {
  if (/^(AElf\.)(.*?)+/.test(name)) {
    return name.split(".")[name.split(".").length - 1];
  }
  return name;
};

const TOKEN_DECIMALS = {
  ELF: 8,
};
let tokenContract = null;

export const FAKE_WALLET = AElf.wallet.getWalletByPrivateKey(
  config.commonPrivateKey
);

export async function getTokenDecimal(symbol) {
  let decimal;
  if (!tokenContract) {
    tokenContract = await aelf.chain.contractAt(config.multiToken, FAKE_WALLET);
  }
  if (!TOKEN_DECIMALS[symbol]) {
    try {
      const tokenInfo = await tokenContract.GetTokenInfo.call({
        symbol,
      });
      decimal = tokenInfo.decimals;
    } catch (e) {
      decimal = 8;
    }
    TOKEN_DECIMALS[symbol] = decimal;
  }
  return TOKEN_DECIMALS[symbol];
}

export async function getFee(transaction) {
  const fee = AElf.pbUtils.getTransactionFee(transaction.Logs || []);
  const resourceFees = AElf.pbUtils.getResourceFee(transaction.Logs || []);
  const decimals = await Promise.all(fee.map((f) => getTokenDecimal(f.symbol)));
  return {
    fee: fee
      .map((f, i) => ({
        ...f,
        amount: new Decimal(f.amount || 0)
          .dividedBy(`1e${decimals[i]}`)
          .toString(),
      }))
      .reduce(
        (acc, v) => ({
          ...acc,
          [v.symbol]: (acc[v.symbol] ?? 0) + +v.amount,
        }),
        {}
      ),
    resources: resourceFees
      .map((v) => ({
        ...v,
        amount: new Decimal(v.amount || 0)
          .dividedBy(`1e${resourceDecimals[v.symbol]}`)
          .toString(),
      }))
      .reduce(
        (acc, v) => ({
          ...acc,
          [v.symbol]: v.amount,
        }),
        {}
      ),
  };
}

export function getOmittedStr(str = "", front = 8, rear = 4) {
  const strArr = [...str];

  const { length } = str;
  if (length > front + rear) {
    strArr.splice(front, length - rear - front, "...");
    return strArr.join("");
  }
  return str;
}
export const callGetMethod = async (params, fnName) => {
  const { contractAddress, param, contractMethod } = params;
  const con = await aelf.chain.contractAt(contractAddress, FAKE_WALLET);
  return con[contractMethod][fnName](param);
};

export const isJsonString = (str) => {
  try {
    if (typeof JSON.parse(str) === "object") {
      return true;
    }
  } catch (e) {
    // nothing
  }
  return false;
};
