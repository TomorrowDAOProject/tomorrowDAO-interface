import { ITransactionResult } from 'types';
import { getProto, getResult } from './deserializeLog';
import { Proto } from './proto';

class ProtoInstance {
  static getProto = async (contractAddress: string) => {
    const proto = Proto.getInstance();
    const rpcUrl = 'https://tdvw-test-node.aelf.io';
    if (!rpcUrl) throw "Can't get current chain RpcUrl";
    if (!contractAddress) throw "Can't get contractAddress";
    if (proto.getProto(contractAddress)) return proto.getProto(contractAddress);

    const protoBuf = await getProto(contractAddress, rpcUrl);
    proto.setProto(contractAddress, protoBuf);
    return protoBuf;
  };

  static getLogEventResult = async <T = any>(params: {
    contractAddress: string;
    logsName: string;
    TransactionResult: ITransactionResult;
  }) => {
    await ProtoInstance.getProto(params.contractAddress);
    return getResult<T>(params);
  };
}

export default ProtoInstance;
