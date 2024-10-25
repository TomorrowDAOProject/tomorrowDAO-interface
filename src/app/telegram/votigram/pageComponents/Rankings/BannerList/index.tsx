import { FC, useEffect, useState } from 'react';

import Image from 'next/image';

interface BannerList {
  bannerList: IRankingsItem[];
  onClick: (selectedItem: IRankingsItem) => void;
}

const BannerList: FC<BannerList> = ({ bannerList, onClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex >= bannerList.length ? 0 : newIndex);
    }, 5000);

    return () => clearTimeout(timer);
  });

  return (
    bannerList && (
      <Image
        key={`${bannerList[currentIndex].bannerUrl}_${Math.floor(Math.random() * 3)}`}
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
