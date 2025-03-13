import { IContractOptions, ISendResult, IContractError, SupportedELFChainId } from 'types';
import { store } from 'redux/store';
import { formatErrorMsg } from './util';
import { getTxResult } from 'utils/getTxResult';
import { sleep } from 'utils/common';
import { daoAddress } from 'config';

type CreateDaoContractParams = {
  contractAddress: string;
  methodName: string;
  args?: unknown;
};

export const daoCreateContractRequest = async <T, R>(
  callSendMethod: (chainId: string, params: CreateDaoContractParams) => R,
  methodName: string,
  params?: T,
  options?: IContractOptions,
): Promise<R | ISendResult> => {
  const info = store.getState().elfInfo.elfInfo;
  const contractAddress = daoAddress;

  const curChain: Chain = info.curChain ?? SupportedELFChainId.TDVW_NET;

  console.log(
    '=====multiTokenContractRequest methodName, type, contractAddress, curChain, params: ',
    methodName,
    options?.type,
    contractAddress,
    curChain,
    params,
  );

  try {
    const res: R = await callSendMethod?.(curChain, {
      contractAddress,
      methodName,
      args: params,
    });
    const result = res as IContractError;
    if (result?.error || result?.code || result?.Error) {
      throw formatErrorMsg(result);
    }

    const { transactionId, TransactionId } = result.result || result;
    const resTransactionId = TransactionId || transactionId;
    await sleep(1000);
    const transaction = await getTxResult(resTransactionId!, curChain as Chain);

    console.log('=====tokenAdapterContractRequest transaction: ', methodName, transaction);
    return { TransactionId: transaction.TransactionId, TransactionResult: transaction.txResult };
  } catch (error) {
    console.error('=====tokenAdapterContractRequest error:', methodName, JSON.stringify(error));
    const resError = error as IContractError;
    throw formatErrorMsg(resError);
  }
};
