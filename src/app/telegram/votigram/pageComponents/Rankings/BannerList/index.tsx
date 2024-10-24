import { FC, useEffect, useState } from 'react';

interface BannerList {
  bannerList: string[];
}

const BannerList: FC<BannerList> = ({ bannerList }) => {
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newIndex = startIndex + 1;
      setStartIndex(newIndex >= bannerList.length ? 0 : newIndex);
    }, 5000);

    return () => clearTimeout(timer);
  });

  return (
    bannerList && (
      <img
        key={bannerList[startIndex]}
        className="animate-vibrate rounded-2xl w-full"
        src={bannerList[startIndex]}
        alt="banner"
      />
    )
  );
};

export default BannerList;
