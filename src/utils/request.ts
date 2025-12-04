import { host } from 'config';
import { sleep } from './common';

export const getHost = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : host;
};

export const retryWrap = async <T>(
  fn: () => Promise<T>,
  cancelStrategy?: (data: T) => boolean,
  time = 1000 * 60,
  interval = 2000,
) => {
  const now = Date.now();
  const retry = async () => {
    try {
      const cur = Date.now();
      const diff = cur - now;
      if (diff > time) {
        return null;
      }
      const res = await fn();
      if (cancelStrategy && cancelStrategy(res)) {
        return res;
      }
      await sleep(interval + 2);
      return retry();
    } catch (error) {
      await sleep(interval);
      return retry();
    }
  };
  return retry();
};
