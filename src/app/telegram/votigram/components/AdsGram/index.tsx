import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
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
  onCustomReward?: () => void;
}

const AdsGram = forwardRef<IAdsGramRef, IAdsGramProps>(({ onCustomReward }, ref) => {
  const rewardModalRef = useRef<ICommonModalRef>(null);

  const onReward = useCallback(async (result: ShowPromiseResult) => {
    if (result?.done) {
      rewardModalRef.current?.open();
      onCustomReward?.();
    }
  }, []);
  const onError = useCallback((result: ShowPromiseResult) => {
    alert(JSON.stringify(result, null, 4));
  }, []);

  const showAd = useAdsgram({
    blockId: process.env.NEXT_PUBLIC_ADSGRAM_ID || '',
    onReward,
    onError,
  });

  useImperativeHandle(ref, () => ({
    showAd,
  }));

  return (
    <CommonModal
      ref={rewardModalRef}
      title="Congratulations!"
      content={
        <div className="flex flex-col justify-center items-center">
          <Image src={Present} width={96} height={96} alt="Congratulations!" className="my-6" />
          <span className="text-sm">Here is your rewards</span>
          <span className="text-[22px] text-[#51FF00] mb-[40px] font-semibold">+5,000</span>
          <Button
            onClick={() => rewardModalRef.current?.close()}
            type="primary"
            className="w-full text-[17px] !bg-[#5222D8] font-semibold active:bg-[#5222D8] active:shadow-[0_0_0_4px_rgba(117,78,224,0.40)]"
          >
            I See
          </Button>
        </div>
      }
    />
  );
});

export default AdsGram;
