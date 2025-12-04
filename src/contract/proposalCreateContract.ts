import { IContractOptions, ContractMethodType, IContractError } from 'types';
import { formatErrorMsg } from './util';
import { getTxResult } from 'utils/getTxResult';
import { sleep } from 'utils/common';
import { propalAddress, curChain } from 'config';
import { webLoginInstance } from './webLogin';
// import ProtoInstance from 'utils/decode-log';

export const proposalCreateContractRequest = async <T>(
  methodName: string,
  params: T,
  options?: IContractOptions,
): Promise<IContractResult> => {
  const contractAddress = propalAddress;

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
      const res: { data: any } = await webLoginInstance.callViewMethod(curChain, {
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

      // console.log('=====tokenAdapterContractRequest transaction: ', methodName, transaction);
      // const proposalCreatedRes = await ProtoInstance.getLogEventResult<IProposalCreated>({
      //   contractAddress: propalAddress,
      //   logsName: 'ProposalCreated',
      //   TransactionResult: transaction,
      // });
      return transaction;
    }
  } catch (error) {
    console.error('=====tokenAdapterContractRequest error:', methodName, JSON.stringify(error));
    const resError = error as IContractError;
    const a = formatErrorMsg(resError);
    throw a;
  }
};
