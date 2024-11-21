import React from 'react';

import Slider from 'react-slick';
import Image from 'next/image';
import { ReactComponent as Vote } from 'assets/icons/vote.svg';
import { RANKING_LABEL_KEY } from 'constants/ranking';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './index.css';
import clsx from 'clsx';

const settings = {
  arrows: false,
  dots: false,
  infinite: false,
  centerMode: false,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  centerPadding: '16px',
  variableWidth: true,
};

type ItemClickParams = {
  proposalId: string;
  proposalTitle: string;
  isGold: boolean;
};

interface IOfficialList {
  data: IRankingsItem[];
  onItemClick({ proposalId, proposalTitle, isGold }: ItemClickParams): void;
}

const OfficialList = ({ data, onItemClick }: IOfficialList) => {
  return (
    <div className="w-full votigram-featured-list-container">
      <span className="tracking-[1px] leading-[16px] text-[16px] text-[#9A9A9A] font-[510] title">
        OFFICIAL
      </span>
      <Slider className="mt-5 pl-4" {...settings}>
        {data?.map(({ proposalId, proposalTitle, labelType, bannerUrl, totalVoteAmount }) => (
          <div
            key={proposalId}
            className="!flex flex-col !w-[300px] gap-2"
            onClick={() => {
              onItemClick({
                proposalId,
                proposalTitle,
                isGold: labelType === RANKING_LABEL_KEY.GOLD,
              });
            }}
          >
            <div className="relative w-[300px] h-[100px] rounded-2xl overflow-hidden">
              {bannerUrl !== undefined ? (
                <Image src={bannerUrl} fill alt="Banner" priority />
              ) : (
                <div className="h-full bg-[#353535] w-full animate-pulse" />
              )}
            </div>

            {proposalTitle !== undefined ? (
              <div className="overflow-hidden whitespace-nowrap">
                <div
                  className={clsx('flex gap-5', {
                    'animate-scroll-left': proposalTitle?.length >= 35,
                  })}
                >
                  <p className="flex text-[#E0E0E0] font-semibold text-[14px] leading-[18px] tracking-[-0.4px]">
                    {proposalTitle}
                  </p>
                  {proposalTitle?.length >= 35 && (
                    <p className="flex text-[#E0E0E0] font-semibold text-[14px] leading-[18px] tracking-[-0.4px]">
                      {proposalTitle}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-1 mt-1">
                <div className="h-3 bg-[#353535] w-full rounded animate-pulse" />
              </div>
            )}
            <div className="flex gap-[7px] items-center">
              <Vote className="text-[16px] text-[#9A9A9A]" />
              {totalVoteAmount !== undefined ? (
                <span className="flex tracking-[-1px] text-[12px] leading-[16px] font-normal text-[#51FF00]">
                  {totalVoteAmount}
                </span>
              ) : (
                <div className="h-3 bg-[#353535] w-1/5 rounded animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default OfficialList;
