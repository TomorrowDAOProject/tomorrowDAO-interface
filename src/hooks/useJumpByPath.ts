import { useCallback } from 'react';
import isPortkeyApp from 'utils/isPortkeyApp';

const useJumpByPath = () => {
  const jump = useCallback((path?: string) => {
    if (isPortkeyApp()) {
      window.location.href = `${path || ''}`;
    } else {
      window.open(`${path || ''}`);
    }
  }, []);
  return jump;
};

export default useJumpByPath;
