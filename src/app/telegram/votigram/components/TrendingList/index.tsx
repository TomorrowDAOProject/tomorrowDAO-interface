import React from 'react';

import Image from 'next/image';
import { ReactComponent as Vote } from 'assets/icons/vote.svg';
import { RANKING_LABEL_KEY } from 'constants/ranking';
import clsx from 'clsx';

import './index.css';

type ItemClickParams = {
  proposalId: string;
  proposalTitle: string | undefined;
  isGold: boolean;
};

interface ITrendingList {
  data: IRankingsItem[];
  onItemClick({ proposalId, proposalTitle, isGold }: ItemClickParams): void;
}

const TrendingList = ({ data, onItemClick }: ITrendingList) => {
  return (
    <div className="w-full votigram-featured-list-container">
      <span className="tracking-[1px] leading-[16px] text-[16px] text-[#9A9A9A] font-[510] title">
        TRENDING
      </span>
      <div className="mt-[15px] flex flex-col gap-[15px]">
        {data?.map(({ proposalId, proposalTitle, labelType, bannerUrl, totalVoteAmount }) => (
          <div
            key={proposalId}
            className="flex flex-col w-full gap-2"
            data-testid={proposalId}
            onClick={() => {
              onItemClick({
                proposalId,
                proposalTitle,
                isGold: labelType === RANKING_LABEL_KEY.GOLD,
              });
            }}
          >
            <div className="relative w-full min-h-[120px] rounded-2xl overflow-hidden">
              {bannerUrl !== undefined ? (
                <Image src={bannerUrl} fill alt="Banner" priority />
              ) : (
                <div
                  data-testid="proposal-banner-testid"
                  className="h-full bg-[#353535] w-full animate-pulse"
                />
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
              <div data-testid="proposal-title-testId" className="flex flex-col gap-1 mt-1">
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
                <div
                  data-testid="proposal-vote-testId"
                  className="h-3 bg-[#353535] w-1/5 rounded animate-pulse"
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingList;
