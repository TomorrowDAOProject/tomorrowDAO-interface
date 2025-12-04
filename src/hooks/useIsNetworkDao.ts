import { usePathname } from 'next/navigation';
import { NetworkDaoHomePathName, networkDaoId } from 'config';

export default function useIsNetworkDao() {
  const pathName = usePathname();
  const isNetWorkDao = pathName.includes(NetworkDaoHomePathName);
  return {
    isNetWorkDao,
    networkDaoId: networkDaoId,
  };
}
