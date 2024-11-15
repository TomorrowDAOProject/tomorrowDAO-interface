import { useCallback, useEffect, useRef } from 'react';
/**
 * Check Typescript section
 * and use your path to adsgram types
 */
import type { AdController, ShowPromiseResult } from '../../../../types/adsgram';
import dayjs from 'dayjs';
import sha256 from 'crypto-js/sha256';
import { updateAdsView } from 'api/request';
import { curChain } from 'config';

export interface useAdsgramParams {
  blockId: string;
  onReward: (result: ShowPromiseResult) => void;
  onError?: (result: ShowPromiseResult) => void;
}

export function useAdsgram({ blockId, onReward, onError }: useAdsgramParams): () => Promise<void> {
  const AdControllerRef = useRef<AdController | undefined>(undefined);

  useEffect(() => {
    AdControllerRef.current = window.Adsgram?.init({
      blockId,
      debug: true,
      debugBannerType: 'RewardedVideo',
    });
  }, [blockId]);

  return useCallback(async () => {
    if (AdControllerRef.current) {
      AdControllerRef.current
        .show()
        .then(async (result) => {
          if (result?.done) {
            const timestamp = dayjs().valueOf();
            const hash = sha256(`${process.env.NEXT_PUBLIC_HASH_PRIVATE_KEY}-${timestamp}`);

            await updateAdsView({
              chainId: curChain,
              timestamp,
              signature: hash.toString(),
            });

            onReward(result);
          }
        })
        .catch((result: ShowPromiseResult) => {
          // user get error during playing ad or skip ad
          onError?.(result);
        });
    } else {
      onError?.({
        error: true,
        done: false,
        state: 'load',
        description: 'Adsgram script not loaded',
      });
    }
  }, [onError, onReward]);
}
