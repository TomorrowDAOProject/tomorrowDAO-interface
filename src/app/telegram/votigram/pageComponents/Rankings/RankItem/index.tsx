import React from 'react';

import { ReactComponent as ChevronRight } from 'assets/icons/chevron-right.svg';
import { RANKING_LABEL_KEY, RANKING_TYPE, RANKING_TYPE_KEY } from 'constants/ranking';
import dayjs from 'dayjs';
import clsx from 'clsx';

type ItemClickParams = {
  proposalId: string;
  proposalTitle: string;
  isGold: boolean;
};

interface RankItemProps {
  proposalId: string;
  proposalTitle: string;
  rankingType: RANKING_TYPE_KEY;
  labelType: number;
  activeEndEpochTime: number;
  totalVoteAmount: number;
  onItemClick({ proposalId, proposalTitle, isGold }: ItemClickParams): void;
}

const RankItem: React.FC<RankItemProps> = ({
  proposalId,
  proposalTitle,
  rankingType,
  labelType,
  totalVoteAmount = 0,
  activeEndEpochTime,
  onItemClick,
}) => {
  return (
    <div
      className={clsx(
        'flex p-4 gap-4 bg-[#1B1B1B] rounded-2xl w-full items-center relative overflow-hidden',
        {
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
      <img
        className="flex h-12 w-12"
        src={
          RANKING_TYPE_KEY.COMMUNITY === rankingType
            ? '/images/tg/community-icon.png'
            : '/images/tg/ranking-icon.png'
        }
        alt="rankings-icon"
      />
      <div className="flex flex-col gap-[2px] flex-1 overflow-hidden">
        <div className="flex gap-2">
          <span className="text-base leading-6 flex-[8]">{proposalTitle}</span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="text-xs px-2 rounded-full border border-[#2D1F73] border-solid text-[#ACA6FF] text-center">
            {RANKING_TYPE[rankingType || 1]}
          </div>
          <span className="text-[#9A9A9A] text-sm">
            Total Votes <span className="text-[#51FF00] font-semibold">{totalVoteAmount}</span>
          </span>
        </div>
      </div>
      <ChevronRight className="text-base" />
      {dayjs() > dayjs(activeEndEpochTime) && (
        <div className="absolute top-0 left-0 bg-[#221D51] px-[10px] py-[2px] text-[10px] rounded-br-full">
          Expired
        </div>
      )}
    </div>
  );
};

export default RankItem;
