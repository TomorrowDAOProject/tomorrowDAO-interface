import clsx from 'clsx';
import { ReactComponent as Vote } from 'assets/icons/vote.svg';
import { RANKING_LABEL_KEY, RANKING_TYPE, RANKING_TYPE_KEY } from 'constants/ranking';
import dayjs from 'dayjs';
import React from 'react';

type ItemClickParams = {
  proposalId: string;
  proposalTitle: string;
  isGold: boolean;
};

interface IOfficialItem {
  proposalId: string;
  proposalTitle: string;
  rankingType: RANKING_TYPE_KEY;
  bannerUrl: string;
  activeEndEpochTime: number;
  labelType: number;
  totalVoteAmount: number;
  onItemClick({ proposalId, proposalTitle, isGold }: ItemClickParams): void;
}

const OfficialItem = ({
  proposalId,
  proposalTitle,
  rankingType,
  bannerUrl,
  labelType,
  activeEndEpochTime,
  totalVoteAmount = 0,
  onItemClick,
}: IOfficialItem) => {
  return (
    <div
      className={clsx(
        'flex flex-col rounded-2xl overflow-hidden relative bg-[#1C1C1C] active:bg-[#2A2A2A] active:shadow-[0_0_0_4px_rgba(117,78,224,0.40)]',
        {
          'bg-opacity-80': dayjs() > dayjs(activeEndEpochTime),
          'opacity-70': dayjs() > dayjs(activeEndEpochTime),
        },
      )}
      onClick={() =>
        onItemClick?.({
          proposalId,
          proposalTitle,
          isGold: labelType === RANKING_LABEL_KEY.GOLD,
        })
      }
    >
      <div className="relative">
        <img
          src={bannerUrl === '' ? '/images/tg/default-banner.png' : bannerUrl}
          className="w-full max-h-[121px] rounded-2xl"
          alt="banner"
        />
        <div className="absolute right-[6px] bottom-[6px] gap-1 bg-[#1B1B1B] flex items-center py-0.5 px-2 rounded-full">
          <span className="text-[#ACA6FF]">{RANKING_TYPE[rankingType || 1]}</span>
          <span className="text-[#292929]">|</span>
          <span className="flex items-center text-[#51FF00] font-semibold gap-[5px]">
            <Vote className="text-[13px] text-[#9A9A9A]" />
            {totalVoteAmount.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="px-4 py-2 left-[126px] flex w-full h-full gap-2 items-center overflow-hidden whitespace-nowrap">
        <div className="flex gap-5 animate-scroll-left">
          <p className="text-base">{proposalTitle}</p>
          <p className="text-base">{proposalTitle}</p>
        </div>
      </div>
      {dayjs() > dayjs(activeEndEpochTime) && (
        <div className="absolute top-0 left-0 bg-[#221D51] px-[10px] py-[2px] text-[10px] rounded-br-full">
          Expired
        </div>
      )}
    </div>
  );
};

export default OfficialItem;
