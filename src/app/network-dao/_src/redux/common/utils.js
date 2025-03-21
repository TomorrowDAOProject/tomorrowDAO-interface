/**
 * @file utils
 * @author atom-yang
 */
import dayjs from "dayjs";
import getChainIdQuery from 'utils/url';
import constants from "./constants";
import { toast } from "react-toastify";
const { viewer } = constants;

const getProposalTypeText = {
  1: 'Parliament',
  2: 'Association',
  3: 'Referendum'
}

export const arrayToMap = (arr) =>
  arr.reduce(
    (acc, v) => ({
      ...acc,
      [v]: v,
    }),
    {}
  );

export const getContractAddress = (name) => {
  const tempName = typeof name === 'number' ? getProposalTypeText[name] : name;
  const result = viewer.contractAddress.filter(
    (item) => item.contractName === tempName
  );
  return result.length > 0
    ? result[0].contractAddress
    : getContractAddress("Genesis");
};

export const parseJSON = (str = "") => {
  let result = null;
  try {
    result = JSON.parse(str);
  } catch (e) {
    result = str;
  }
  return result;
};

export const getSignParams = async (wallet, currentWallet) => {
  const timestamp = new Date().getTime();
  try {
    const signature = await wallet.sign(timestamp);
    return {
      address: currentWallet.address,
      signature,
      pubKey: currentWallet.publicKey,
      timestamp,
    };
  } catch (e) {
    toast.warn((e.errorMessage || {}).message || "night ELF is locked!");
    return {};
  }
};

export const rand16Num = (len = 0) => {
  const result = [];
  for (let i = 0; i < len; i += 1) {
    result.push("0123456789abcdef".charAt(Math.floor(Math.random() * 16)));
  }
  return result.join("");
};

export const showTransactionResult = (result) => {
  console.log(result);
  if ((result && +result.error === 0) || !result.error) {
    const ret =
      (result.transactionId && result) ||
      result.result ||
      result.data ||
      result;
    toast.info(
      "The transaction is in progress. Please query the transaction ID", {
        icon: <i className="tmrwdao-icon-information-filled text-[16px] text-white" />,
      });
    toast.info(
      `Transaction ID: ${ret.transactionId || ret.TransactionId}`,
      {
        icon: <i className="tmrwdao-icon-information-filled text-[16px] text-white" />,
      }
    );
    return result;
  }
  throw new Error(
    (result.errorMessage || {}).message ||
    (result.error && result.error.message) ||
    "Send transaction failed"
  );
};

export function isInnerType(inputType) {
  return (
    inputType.fieldsArray &&
    inputType.fieldsArray.length === 1 &&
    (inputType.name === "Hash" || inputType.name === "Address") &&
    inputType.fieldsArray[0].type === "bytes"
  );
}

export function isSingleStringParameter(inputType) {
  return (
    (inputType.fieldsArray &&
      inputType.fieldsArray.length === 1 &&
      inputType.fieldsArray[0].type.indexOf(".") === -1) ||
    isInnerType(inputType)
  );
}

export function isEmptyInputType(inputType) {
  return !inputType.fieldsArray || inputType.fieldsArray.length === 0;
}

export function isSpecialParameters(inputType) {
  return (
    inputType.type.indexOf("aelf.Address") > -1 ||
    inputType.type.indexOf("aelf.Hash") > -1
  );
}

export function getParams(inputType) {
  const fieldsLength = Object.keys(inputType.toJSON().fields || {}).length;
  let result = {};
  if (fieldsLength === 0) {
    return {};
  }
  if (isInnerType(inputType)) {
    const type = inputType.fieldsArray[0];
    return {
      [type.name]: {
        repeated: type.repeated,
        type: inputType.name,
        name: type.name,
        required: type.required,
      },
    };
  }
  Object.keys(inputType.fields).forEach((name) => {
    const type = inputType.fields[name];
    if (
      type.resolvedType &&
      !isSpecialParameters(type) &&
      (type.type || "").indexOf("google.protobuf.Timestamp") === -1
    ) {
      result = {
        ...result,
        [type.name]: getParams(type.resolvedType),
      };
    } else {
      result = {
        ...result,
        [name]: {
          repeated: type.repeated,
          type: type.type,
          name: type.name,
          required: type.required,
        },
      };
    }
  });
  return result;
}

export function formatTimeToNano(time) {
  let millseconds = 1;
  const now = new Date().toISOString();
  const nanosecondsMatch = now.match(/\.(\d{1,9})Z$/);
  if (nanosecondsMatch) {
    millseconds = nanosecondsMatch[1]
  }

  return {
    seconds: dayjs(time).unix(),
    // todo: edit
    nanos: millseconds * 1000000,
  };
}

export function uint8ToBase64(u8Arr) {
  return Buffer.from(u8Arr).toString("base64");
  // const CHUNK_SIZE = 0x8000;
  // let index = 0;
  // const arrLength = u8Arr.length;
  // let result = "";
  // let slice;
  // while (index < arrLength) {
  //   slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, arrLength));
  //   result += String.fromCharCode.apply(null, slice);
  //   index += CHUNK_SIZE;
  // }
  // console.log(u8Arr, u8Arr.length, result);
  // return result;
}

export function base64ToHex(base64) {
  return Buffer.from(base64, "base64").toString("hex");
  // let result = "";
  // for (let i = 0; i < raw.length; i++) {
  //   const hex = raw.charCodeAt(i).toString(16);
  //   result += hex.length === 2 ? hex : `0${hex}`;
  // }
  // return result.toUpperCase();
}

export const sendTransaction = async (
  wallet,
  contractAddress,
  method,
  param
  // eslint-disable-next-line consistent-return
) => {
  try {
    const result = await wallet.invoke({
      contractAddress,
      param,
      contractMethod: method,
    });
    showTransactionResult(result);
    return result;
  } catch (e) {
    toast.error(
      (e.errorMessage || {}).message || e.message || "Send Transaction failed"
    );
  }
};

export const sendTransactionWith = async (
  callContract,
  contractAddress,
  method,
  param
  // eslint-disable-next-line consistent-return
) => {
  try {
    param = param || {};
    console.log("callContract", {
      contractAddress,
      methodName: method,
      args: param,
    });
    const chainIdQuery = getChainIdQuery();
    const result = await callContract({
      chainId: chainIdQuery.chainId,
      contractAddress,
      methodName: method,
      args: param,
      sendOptions: {
        chainId: chainIdQuery.chainId
      }
    });
    showTransactionResult(result);
    if (result.transactionId) {
      result.TransactionId = result.transactionId;
    }
    return result;
  } catch (e) {
    console.log('sendTransactionWith error', e)
    toast.error(
      (e?.errorMessage || {})?.message?.Message || e.message || "Send Transaction failed"
    );
  }
};

export async function getTxResult(
  aelf,
  txId,
  times = 0,
  delay = 3000,
  timeLimit = 10
) {
  const currentTime = times + 1;
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, delay);
  });
  let tx;
  try {
    tx = await aelf.chain.getTxResult(txId);
  } catch (e) {
    if (e.Status) {
      return e;
    }
    throw new Error("Network Error");
  }
  if (tx.Status === "PENDING" && currentTime <= timeLimit) {
    const result = await getTxResult(aelf, txId, currentTime, delay, timeLimit);
    return result;
  }
  if (tx.Status === "PENDING" && currentTime > timeLimit) {
    return tx;
  }
  if (tx.Status === "MINED") {
    return tx;
  }
  return tx;
}

export const commonFilter = (input, option) =>
  option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;

export function getCsrfToken() {
  return document.cookie.replace(
    // eslint-disable-next-line no-useless-escape
    /(?:(?:^|.*;\s*)csrfToken\s*\=\s*([^;]*).*$)|^.*$/,
    "$1"
  );
}
