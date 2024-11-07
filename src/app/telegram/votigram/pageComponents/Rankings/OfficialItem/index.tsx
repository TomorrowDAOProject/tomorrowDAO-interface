import clsx from 'clsx';
import { ReactComponent as ChevronRight } from 'assets/icons/chevron-right.svg';
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
      className={clsx('flex rounded-2xl overflow-hidden relative', {
        'opacity-70': dayjs() > dayjs(activeEndEpochTime),
      })}
      onClick={() =>
        onItemClick?.({
          proposalId,
          proposalTitle,
          isGold: labelType === RANKING_LABEL_KEY.GOLD,
        })
      }
    >
      <img
        src={bannerUrl === '' ? '/images/tg/default-banner.png' : bannerUrl}
        className="w-full max-h-[121px]"
      />
      <div className="absolute p-4 left-[126px] flex opacity-80 w-full h-full bg-black gap-2 items-center">
        <div className="flex flex-col w-[184px]">
          <span className="text-base mb-1">{proposalTitle}</span>
          <div className="text-xs px-2 w-max mb-2 rounded-full border border-[#2D1F73] border-solid text-[#ACA6FF] text-center">
            {RANKING_TYPE[rankingType || 1]}
          </div>
          <span className="text-[#9A9A9A] text-sm">
            Total Votes <span className="text-[#51FF00] font-semibold">{totalVoteAmount}</span>
          </span>
        </div>
        <ChevronRight className="text-base" />
      </div>
    </div>
  );
};

export default OfficialItem;
