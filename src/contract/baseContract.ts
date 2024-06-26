import { CallContractParams, useCallContract } from 'aelf-web-login';
import { SupportedELFChainId, ContractMethodType } from 'types';
import { store } from 'redux/store';

type TMethodType = <T, R>(params: CallContractParams<T>) => Promise<R>;

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
const chainAndRPCMap: TChainAndRpcMapType = {};

export function useRegisterContractServiceMethod() {
  const info = store.getState().elfInfo.elfInfo;
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
  const { callSendMethod: callAELFSendMethod, callViewMethod: callAELFViewMethod } =
    useCallContract(chainAndRPCMap[SupportedELFChainId.MAIN_NET]);
  const { callSendMethod: callTDVVSendMethod, callViewMethod: callTDVVViewMethod } =
    useCallContract(chainAndRPCMap[SupportedELFChainId.TDVV_NET]);
  const { callSendMethod: callTDVWSendMethod, callViewMethod: callTDVWViewMethod } =
    useCallContract(chainAndRPCMap[SupportedELFChainId.TDVW_NET]);

  contractMethodMap[SupportedELFChainId.MAIN_NET] = {
    callSendMethod: callAELFSendMethod,
    callViewMethod: callAELFViewMethod,
  } as ICallMethodMap;
  contractMethodMap[SupportedELFChainId.TDVV_NET] = {
    callSendMethod: callTDVVSendMethod,
    callViewMethod: callTDVVViewMethod,
  } as ICallMethodMap;
  contractMethodMap[SupportedELFChainId.TDVW_NET] = {
    callSendMethod: callTDVWSendMethod,
    callViewMethod: callTDVWViewMethod,
  } as ICallMethodMap;
}

export function GetContractServiceMethod(
  chain: Chain,
  type?: ContractMethodType,
): <T, R>(params: CallContractParams<T>, sendOptions?: undefined) => Promise<R> {
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
