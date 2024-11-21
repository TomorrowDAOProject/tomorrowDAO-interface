import React from 'react';

import Image from 'next/image';
import { ReactComponent as ChevronRight } from 'assets/icons/chevron-right.svg';

import './index.css';

interface IHeaderProps {
  points: number;
  hasCompletedAds: boolean;
  onPointsClick: () => void;
  onAdsVideoClick: () => void;
}

const Header = ({ points, hasCompletedAds, onPointsClick, onAdsVideoClick }: IHeaderProps) => {
  return (
    <div className="votigram-header-container">
      <div className="flex flex-col" onClick={onPointsClick}>
        <span className="text-white text-[10px] tracking-[-0.4px]">Points Accumulated</span>
        <div className="flex gap-[3px] items-center">
          <span className="text-[#51FF00] text-[18px] font-semibold">
            {points.toLocaleString()}
          </span>
          <ChevronRight className="flex-1 text-white text-[16px]" />
        </div>
      </div>
      {!hasCompletedAds && (
        <div className="flex items-center">
          <div className="arrow-box">Watch Ads For Free Points!</div>
          <div className="w-[33px] h-[23px] relative" onClick={onAdsVideoClick}>
            <Image
              src="https://cdn.tmrwdao.com/assets/imgs/7D01A41D7271.webp"
              alt="Watch Video"
              fill
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
