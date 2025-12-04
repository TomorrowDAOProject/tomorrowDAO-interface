import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { NetworkDaoHomePathName } from 'config';

export default function useNetworkDaoRouter() {
  const router = useRouter();
  const push = useCallback(
    (path: string) => {
      router.push(`${NetworkDaoHomePathName}/${path}`);
    },
    [router],
  );
  return {
    push,
  };
}
