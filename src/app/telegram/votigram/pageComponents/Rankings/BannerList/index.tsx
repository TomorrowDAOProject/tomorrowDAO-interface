import { FC, useEffect, useRef, useState } from 'react';
import { useUpdate } from 'ahooks';

import Image from 'next/image';

import dayjs from 'dayjs';

interface BannerList {
  bannerList: IRankingsItem[];
  onClick: (selectedItem: IRankingsItem) => void;
}

const BannerList: FC<BannerList> = ({ bannerList, onClick }) => {
  const forceRender = useUpdate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const latestIndex = useRef(currentIndex);
  latestIndex.current = currentIndex;

  useEffect(() => {
    const timer = setInterval(() => {
      const newIndex = latestIndex.current + 1;
      setCurrentIndex(newIndex >= bannerList.length ? 0 : newIndex);
      forceRender();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    bannerList && (
      <Image
        key={`${bannerList[currentIndex].bannerUrl}_${dayjs().unix()}`}
        src={bannerList[currentIndex].bannerUrl}
        className="animate-vibrate rounded-2xl w-full h-full"
        alt="banner"
        width={179}
        height={60}
        onClick={() => {
          onClick(bannerList[currentIndex]);
        }}
      />
    )
  );
};

export default BannerList;
