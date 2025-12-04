'use client';
import { useCallback, useEffect, useState } from 'react';
const DEFAULT_LOADING_TEXT = 'Loading...';
import myEvents from 'utils/myEvent';
import LoadingComponent from 'components/LoadingComponent';

export interface ILoadingInfo {
  isLoading: boolean;
  text: string | React.ReactNode;
}

export default function PageLoading() {
  const [loadingInfo, setLoadingInfo] = useState<ILoadingInfo>({
    isLoading: false,
    text: DEFAULT_LOADING_TEXT,
  });

  const setLoadingHandler = useCallback(({ isLoading, text }: ILoadingInfo) => {
    setLoadingInfo({
      isLoading,
      text: text ?? DEFAULT_LOADING_TEXT,
    });
  }, []);

  useEffect(() => {
    const { remove } = myEvents.SetGlobalLoading.addListener(setLoadingHandler);
    return () => {
      remove();
    };
  }, [setLoadingHandler]);
  return loadingInfo.isLoading ? (
    <div className="fixed top-0 right-0 bottom-0 left-0 bg-black/60 z-[99999]">
      <div className="fixed top-1/2 left-1/2 max-w-[calc(100vw-96px)] w-full md:w-[391px] p-[30px] border border-fillBg8 border-solid rounded-[8px] bg-darkBg -translate-x-1/2 -translate-y-1/2 z-[100000]">
        <LoadingComponent
          className="-my-3 md:my-0 scale-[0.7] md:scale-[1.0]"
          size={74}
          strokeWidth={8}
        />
        {!!loadingInfo.text && (
          <span className="mt-6 block text-center font-Montserrat text-white text-descM16">
            {loadingInfo.text}
          </span>
        )}
      </div>
    </div>
  ) : null;
}
