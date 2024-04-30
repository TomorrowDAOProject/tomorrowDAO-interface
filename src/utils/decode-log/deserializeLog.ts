import AElf from 'aelf-sdk';
import { Proto } from './proto';
import { ITransactionResult } from 'types';

export interface ITransactionLog {
  Address: string;
  Name: string;
  Indexed: string[];
  NonIndexed: string;
}

function decodeBase64(str: string) {
  const { util } = AElf.pbjs;
  const buffer = util.newBuffer(util.base64.length(str));
  util.base64.decode(str, buffer, 0);
  return buffer;
}

export async function getProto(address: string, rpc: string) {
  try {
    const aelf = new AElf(new AElf.providers.HttpProvider(rpc));
    const file = await aelf.chain.getContractFileDescriptorSet(address);
    const content = AElf.pbjs.Root.fromDescriptor(file);

    return content;
  } catch (e) {
    return null;
  }
}

function getDeserializeLogResult(serializedData: any, dataType: any) {
  let deserializeLogResult = serializedData.reduce((acc: any, v: any) => {
    let deserialize = dataType.decode(decodeBase64(v));
    deserialize = dataType.toObject(deserialize, {
      enums: String, // enums as string names
      longs: String, // longs as strings (requires long.js)
      bytes: String, // bytes as base64 encoded strings
      defaults: false, // includes default values
      arrays: true, // populates empty arrays (repeated fields) even if defaults=false
      objects: true, // populates empty objects (map fields) even if defaults=false
      oneofs: true, // includes virtual oneof fields set to the present field's name
    });
    return {
      ...acc,
      ...deserialize,
    };
  }, {});
  // eslint-disable-next-line max-len
  deserializeLogResult = AElf.utils.transform.transform(
    dataType,
    deserializeLogResult,
    AElf.utils.transform.OUTPUT_TRANSFORMERS,
  );
  deserializeLogResult = AElf.utils.transform.transformArrayToMap(dataType, deserializeLogResult);
  return deserializeLogResult;
}

export async function deserializeLog(log: ITransactionLog, proto: any) {
  try {
    const { Indexed = [], NonIndexed, Name } = log;

    if (!proto) {
      return {};
    }
    const serializedData = [...(Indexed || [])];
    if (NonIndexed) {
      serializedData.push(NonIndexed);
    }

    const dataType = proto.lookupType(Name);

    const deserializeLogResult = getDeserializeLogResult(serializedData, dataType);
    return deserializeLogResult;
  } catch (error) {
    return Promise.reject(error);
  }
}

export const getResult = async <T = any>({
  contractAddress,
  logsName,
  TransactionResult,
}: {
  contractAddress: string;
  logsName: string;
  TransactionResult: ITransactionResult;
}): Promise<T> => {
  const proto = Proto.getInstance().getProto();
  const currentProto = proto[contractAddress];
  if (currentProto) {
    const log = TransactionResult?.Logs?.filter((item) => {
      return item.Name === logsName;
    })?.[0];
    if (log) {
      try {
        const logResult = await deserializeLog(log, currentProto);
        return logResult;
      } catch (error) {
        throw new Error('Deserialize log error');
      }
    } else {
      throw new Error('Log not found');
    }
  } else {
    throw new Error('Proto not found');
  }
};
