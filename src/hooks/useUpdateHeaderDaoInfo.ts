import { useAsyncEffect, useUnmount } from 'ahooks';
import { treasuryContractAddress } from 'config';
import { callViewContract } from 'contract/callContract';
import { eventBus, HeaderUpdateTreasury } from 'utils/myEvent';

const useUpdateHeaderDaoInfo = (daoId?: string, aliasName?: string) => {
  useAsyncEffect(async () => {
    if (!aliasName || !daoId) return;
    const res = await callViewContract<string, string>(
      'GetTreasuryAccountAddress',
      daoId,
      treasuryContractAddress,
    );
    if (!res) return;
    eventBus.emit(HeaderUpdateTreasury, aliasName);
  }, [aliasName, daoId]);
  useUnmount(() => {
    eventBus.emit(HeaderUpdateTreasury, null);
  });
};

export default useUpdateHeaderDaoInfo;
