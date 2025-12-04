import { DependencyList, useCallback, useRef } from 'react';

/**
 * returns the latest value, effectively avoiding the closure problem.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;

  return ref;
}

/**
 * that deal with the debounced function.
 */
// eslint-disable-next-line
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T | undefined,
  deps: DependencyList,
  delay = 500,
) {
  const timer = useRef<NodeJS.Timeout | number>();
  const callbackRef = useLatestRef(callback);
  // eslint-disable-next-line
  return useCallback((...args: any[]) => {
    if (!callbackRef.current) return;
    timer.current && clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      callbackRef.current?.(...args);
    }, delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * that deal with the throttled function.
 */
// eslint-disable-next-line
export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T | undefined,
  deps: DependencyList,
  delay = 500,
) {
  const lock = useRef<number>();
  // eslint-disable-next-line
  return useCallback((...args: any[]) => {
    if (!callback) return;
    const now = Date.now();
    if (lock.current && lock.current + delay > now) return;
    lock.current = now;
    return callback(...args);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
