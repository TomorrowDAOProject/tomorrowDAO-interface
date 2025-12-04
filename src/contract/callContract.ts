import { IContractOptions, IContractError, ContractMethodType, SupportedELFChainId } from 'types';
import { formatErrorMsg } from './util';
import { getTxResult } from 'utils/getTxResult';
import { sleep } from 'utils/common';
import { curChain } from 'config';
import { multiTokenContractRequest } from './multiTokenContract';
import { proposalCreateContractRequest } from './proposalCreateContract';
import { TransactionResult } from '@portkey/types';
import { webLoginInstance } from './webLogin';

export const callContract = async <T>(
  methodName: string,
  params: T,
  address: string,
  options?: IContractOptions,
): Promise<TransactionResult> => {
  console.log(
    '=====multiTokenContractRequest methodName, type, contractAddress, curChain, params: ',
    methodName,
    params,
    address,
    options?.type,
    curChain,
  );

  // const CallContractMethod = GetContractServiceMethod(curChain, options?.type);

  try {
    if (options?.type === ContractMethodType.VIEW) {
      const res: { data: any } = await webLoginInstance.callViewMethod(curChain, {
        contractAddress: address,
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
        contractAddress: address,
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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const transaction = await getTxResult(resTransactionId!, curChain as Chain);

      console.log('=====tokenAdapterContractRequest transaction: ', methodName, transaction);

      return transaction;
    }
  } catch (error) {
    console.error('=====tokenAdapterContractRequest error:', methodName, JSON.stringify(error));
    const resError = error as IContractError;
    const a = formatErrorMsg(resError);
    throw a;
  }
};
export const callViewContract = async <Req, Res>(
  methodName: string,
  params: Req,
  address: string,
): Promise<Res> => {
  try {
    const res: { data: Res } = await webLoginInstance.callViewMethod(curChain, {
      contractAddress: address,
      methodName,
      args: params,
    });
    console.log('=====callViewContract res: ', methodName, res);
    const result = res.data as IContractError;

    if (result?.error || result?.code || result?.Error) {
      throw formatErrorMsg(result);
    }
    const finalRes = res.data as Res;
    return finalRes;
  } catch (error) {
    console.error('=====callViewContract error:', methodName, JSON.stringify(error));
    const resError = error as IContractError;
    const a = formatErrorMsg(resError);
    throw a;
  }
};

export const callMainNetViewContract = async <T>(
  methodName: string,
  params: T,
  address: string,
): Promise<any> => {
  try {
    const res: { data: any } = await webLoginInstance.callViewMethod(SupportedELFChainId.MAIN_NET, {
      contractAddress: address,
      methodName,
      args: params,
    });
    console.log('=====callViewContract res: ', methodName, res);
    const result = res.data as IContractError;

    if (result?.error || result?.code || result?.Error) {
      throw formatErrorMsg(result);
    }
    return res.data;
  } catch (error) {
    console.error('=====callMainNetViewContract error:', methodName, JSON.stringify(error));
    const resError = error as IContractError;
    const a = formatErrorMsg(resError);
    throw a;
  }
};

export interface IGetBalanceParams {
  symbol: string;
  owner: string;
}

export const GetBalanceByContract = async (
  params: IGetBalanceParams,
  options?: IContractOptions,
): Promise<{ balance: number }> => {
  const res = (await multiTokenContractRequest('GetBalance', params, {
    ...options,
    type: ContractMethodType.VIEW,
  })) as { balance: number };
  return res;
};
export const GetTokenInfo = async (
  params: { symbol: string },
  options?: IContractOptions,
): Promise<{ decimals: number }> => {
  const res = (await multiTokenContractRequest('GetTokenInfo', params, {
    ...options,
    type: ContractMethodType.VIEW,
  })) as { decimals: number };
  return res;
};

export const ApproveByContract = async (
  params: any,
  options?: IContractOptions,
): Promise<IContractError> => {
  const res = (await multiTokenContractRequest('Approve', params, {
    ...options,
  })) as IContractError;
  return res;
};

export const GetDaoProposalTimePeriodContract = async (
  params?: string,
  options?: IContractOptions,
): Promise<ITimePeriod> => {
  const res = (await proposalCreateContractRequest('GetDaoProposalTimePeriod', params, {
    ...options,
    type: ContractMethodType.VIEW,
  })) as unknown as ITimePeriod;
  return res;
};
interface IGetAllowanceParams {
  symbol: string;
  owner: string;
  spender: string;
}
interface IGetAllowanceResponse {
  symbol: string;
  owner: string;
  spender: string;
  allowance: number;
}

export const GetAllowanceByContract = async (
  params: IGetAllowanceParams,
  options?: IContractOptions,
): Promise<IGetAllowanceResponse & IContractError> => {
  const res = (await multiTokenContractRequest('GetAllowance', params, {
    ...options,
    type: ContractMethodType.VIEW,
  })) as IGetAllowanceResponse & IContractError;
  return res;
};
