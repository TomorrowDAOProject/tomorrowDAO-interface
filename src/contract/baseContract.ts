import { SupportedELFChainId, ContractMethodType } from 'types';
import { store } from 'redux/store';
import { ICallContractParams } from '@aelf-web-login/wallet-adapter-base';

type TMethodType = <T, R>(params: ICallContractParams<T>) => Promise<R>;

type TChainAndRpcMapType = {
  [key in SupportedELFChainId]?: {
    chainId: string;
    rpcUrl: string;
  };
};
interface ICallMethodMap {
  callSendMethod: TMethodType;
  callViewMethod: TMethodType;
}
type TContractMethodMapType = {
  [key in SupportedELFChainId]?: ICallMethodMap;
};

export const contractMethodMap: TContractMethodMapType = {};

export function GetContractServiceMethod(
  chain: Chain,
  type?: ContractMethodType,
): <T, R>(params: ICallContractParams<T>) => Promise<R> {
  const info = store.getState().elfInfo.elfInfo;

  const chainAndRPCMap: TChainAndRpcMapType = {};

  [
    SupportedELFChainId.MAIN_NET,
    SupportedELFChainId.TDVV_NET,
    SupportedELFChainId.TDVW_NET,
  ].forEach((chain) => {
    chainAndRPCMap[`${chain}`] = {
      chainId: chain,
      rpcUrl: info?.[`rpcUrl${String(chain).toUpperCase()}`],
    };
  });

  if (!chainAndRPCMap[chain]) {
    throw new Error('Error: Invalid chainId');
  }

  if (!chainAndRPCMap[chain]?.rpcUrl) {
    throw new Error('Error: Empty rpcUrl');
  }

  const { callSendMethod, callViewMethod } = contractMethodMap[chain] as ICallMethodMap;

  if (type === ContractMethodType.VIEW) {
    return callViewMethod;
  } else {
    return callSendMethod;
  }
}
