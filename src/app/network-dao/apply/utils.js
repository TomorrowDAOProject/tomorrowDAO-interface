import AElf from "aelf-sdk";
import { getCsrfToken, getTxResult } from "@redux/common/utils";
import { request } from "@common/request";
import { API_PATH } from "@redux/common/constants";

import { deserializeLog } from "@common/utils";
import { WebLoginInstance } from "@utils/webLogin";
import { APPNAME } from "../_src/config/config";
console.log('location search', process.env.APP_ENV)
async function sign(currentWallet, hexToBeSign) {
  if (currentWallet.portkeyInfo) {
    const keypair = currentWallet.portkeyInfo.walletInfo.keyPair;
    const keypairAndUtils = AElf.wallet.ellipticEc.keyFromPrivate(
      keypair.getPrivate()
    );
    const signedMsgObject = keypairAndUtils.sign(hexToBeSign);
    const signature = [
      signedMsgObject.r.toString(16, 64),
      signedMsgObject.s.toString(16, 64),
      `0${signedMsgObject.recoveryParam.toString()}`,
    ].join("");
    return signature;
  }
  const { getSignature } = WebLoginInstance.get().getWebLoginContext();
  const { signature } = await getSignature({
    appName: APPNAME,
    address: currentWallet.address,
    signInfo: hexToBeSign,
  });
  return signature;
}

export async function getDeserializeLog(aelf, txId, logName) {
  if (!txId)
    throw new Error("Transaction failed. Please reinitiate this step.");
  const txRes = await getTxResult(aelf, txId ?? "");
  let txResult = txRes;
  if (txRes?.data) {
    txResult = txRes.data;
  }
  // A transaction is said to be mined when it is included to the blockchain in a new block.
  if (txResult.Status === "MINED") {
    const { Logs = [] } = txResult;
    let log;
    if (Array.isArray(logName)) {
      log = (Logs || []).filter((v) => logName.includes(v.Name));
    } else {
      log = (Logs || []).filter((v) => v.Name === logName);
    }
    if (log.length === 0) {
      return;
    }
    const result = await deserializeLog(log[0], log[0].Name, log[0].Address);
    // eslint-disable-next-line consistent-return
    return result;
  }
}

export const getTransactionResult = async (aelf, txId) => {
  if (!txId) {
    throw new Error("Transaction failed. Please reinitiate this step.");
  }
  const txResult = await getTxResult(aelf, txId ?? "");
  return txResult;
};

