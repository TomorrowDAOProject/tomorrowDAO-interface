import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import Image from 'next/image';
import CommonModal, { ICommonModalRef } from '../../components/CommonModal';
import Present from 'assets/imgs/present.png';
import { Button } from 'antd';
import { ShowPromiseResult } from 'types/adsgram';
import { useAdsgram } from '../../hook/useAdsgram';

export interface IAdsGramRef {
  showAd: Function;
}

interface IAdsGramProps {
  onCustomReward?: (newPoints: number) => void;
  onRewardModalClose?: () => void;
}

const AdsGram = forwardRef<IAdsGramRef, IAdsGramProps>(
  ({ onCustomReward, onRewardModalClose }, ref) => {
    const rewardModalRef = useRef<ICommonModalRef>(null);
    const errorModalRef = useRef<ICommonModalRef>(null);
    const [errorMsg, setErrorMsg] = useState('');

    const onReward = useCallback(async (newPoints: number) => {
      rewardModalRef.current?.open();
      onCustomReward?.(newPoints);
    }, []);
    const onError = useCallback((result: ShowPromiseResult) => {
      if (result.error) {
        setErrorMsg(result.description);
        errorModalRef.current?.open();
      }
    }, []);

    const onSkip = useCallback(() => {
      setErrorMsg('You have to watch the full video to earn the points. ');
      errorModalRef.current?.open();
    }, []);

    const showAd = useAdsgram({
      blockId: process.env.NEXT_PUBLIC_ADSGRAM_ID || '',
      onReward,
      onError,
      onSkip,
    });

    useImperativeHandle(ref, () => ({
      showAd,
    }));

    return (
      <>
        <CommonModal
          ref={rewardModalRef}
          title="Congratulations"
          content={
            <div className="flex flex-col justify-center items-center">
              <Image src={Present} width={96} height={96} alt="Congratulations!" className="my-6" />
              <span className="text-sm">Reward</span>
              <span className="text-[22px] text-[#51FF00] mb-[40px] font-semibold">+5,000</span>
              <Button
                onClick={() => {
                  rewardModalRef.current?.close();
                  onRewardModalClose?.();
                }}
                type="primary"
                className="w-full text-[17px] !bg-[#5222D8] font-semibold active:bg-[#5222D8] active:shadow-[0_0_0_4px_rgba(117,78,224,0.40)]"
              >
                Okay
              </Button>
            </div>
          }
        />
        <CommonModal
          ref={errorModalRef}
          title="Oops"
          content={
            <div className="flex flex-col justify-center items-center">
              <span className="text-sm mb-6 mt-4">{errorMsg}</span>
              <Button
                onClick={() => errorModalRef.current?.close()}
                type="primary"
                className="w-full text-[17px] !bg-[#5222D8] font-semibold active:bg-[#5222D8] active:shadow-[0_0_0_4px_rgba(117,78,224,0.40)]"
              >
                Okay
              </Button>
            </div>
          }
        />
      </>
    );
  },
);

export default AdsGram;
