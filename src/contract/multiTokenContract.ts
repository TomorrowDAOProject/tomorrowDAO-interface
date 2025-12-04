import {
  SupportedELFChainId,
  IContractOptions,
  ContractMethodType,
  ISendResult,
  IContractError,
} from 'types';
import { store } from 'redux/store';
import { formatErrorMsg } from './util';
import { getTxResult } from 'utils/getTxResult';
import { sleep } from 'utils/common';
import { mainChainAddress, sideChainAddress } from 'config';
import { webLoginInstance } from './webLogin';

export const multiTokenContractRequest = async <T, R>(
  methodName: string,
  params: T,
  options?: IContractOptions,
): Promise<R | ISendResult> => {
  const info = store.getState().elfInfo.elfInfo;
  const contractAddressMap = {
    main: mainChainAddress,
    side: sideChainAddress,
  };
  const contractAddress = (options?.chain === SupportedELFChainId.MAIN_NET
    ? contractAddressMap.main
    : contractAddressMap.side) as unknown as string;

  const curChain: Chain = options?.chain || (info?.curChain as Chain);

  console.log(
    '=====multiTokenContractRequest methodName, type, contractAddress, curChain, params: ',
    methodName,
    options?.type,
    contractAddress,
    curChain,
    params,
  );

  try {
    if (options?.type === ContractMethodType.VIEW) {
      const res: { data: R } = await webLoginInstance.callViewMethod(curChain, {
        contractAddress,
        methodName,
        args: params,
      });

      const result = res.data as unknown as IContractError;
      if (result?.error || result?.code || result?.Error) {
        throw formatErrorMsg(result);
      }

      return res.data;
    } else {
      const res = await webLoginInstance.callSendMethod(curChain, {
        contractAddress,
        methodName,
        args: params,
      });
      const result = res as unknown as IContractError;
      if (result?.error || result?.code || result?.Error) {
        throw formatErrorMsg(result);
      }

      const { transactionId, TransactionId } = result.result || result;
      const resTransactionId = TransactionId || transactionId;
      await sleep(1000);

      const transaction = await getTxResult(resTransactionId!, curChain as Chain);

      console.log('=====multiTokenContractRequest transaction: ', methodName, transaction);
      return { TransactionId: transaction.TransactionId, TransactionResult: transaction.txResult };
    }
  } catch (error) {
    console.error('=====multiTokenContractRequest error:', methodName, JSON.stringify(error));
    const resError = error as IContractError;
    throw formatErrorMsg(resError);
  }
};
