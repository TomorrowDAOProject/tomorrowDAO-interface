import React from 'react';

import Image from 'next/image';
import { ReactComponent as Vote } from 'assets/icons/vote.svg';
import { ReactComponent as Add } from 'assets/icons/add.svg';
import { ReactComponent as ChevronRight } from 'assets/icons/chevron-right.svg';

import dayjs from 'dayjs';
import clsx from 'clsx';
import { RANKING_LABEL_KEY } from 'constants/ranking';

import './index.css';

type ItemClickParams = {
  proposalId: string;
  proposalTitle: string | undefined;
  isGold: boolean;
};

interface ICommunityList {
  data: IRankingsItem[];
  onItemClick({ proposalId, proposalTitle, isGold }: ItemClickParams): void;
  handleCreateVote: () => void;
  hasMoreCommunity: boolean;
}

const CommunityList = ({
  data,
  onItemClick,
  handleCreateVote,
  hasMoreCommunity,
}: ICommunityList) => {
  return (
    <div className="votigram-communiy-list">
      <span className="tracking-[1px] leading-[16px] text-[16px] font-[500] title">COMMUNITY</span>
      <div className="flex flex-col gap-[10px] mb-[10px]">
        {data?.map(
          ({ proposalId, activeEndEpochTime, labelType, proposalTitle, totalVoteAmount }) => {
            const isExpired = dayjs() > dayjs(activeEndEpochTime);
            return (
              <div
                key={proposalId}
                className={clsx(
                  'flex bg-[#353535] px-[17px] py-[10px] rounded-[15px] gap-[14px] items-center',
                  {
                    'relative overflow-hidden': isExpired,
                  },
                )}
                onClick={() => {
                  onItemClick({
                    proposalId,
                    proposalTitle,
                    isGold: labelType === RANKING_LABEL_KEY.GOLD,
                  });
                }}
              >
                {isExpired && (
                  <div className="absolute top-0 left-0 bg-[#221D51] text-[#ACA6FF] z-[1] px-[10px] py-[2px] text-[10px] rounded-br-full">
                    Expired
                  </div>
                )}
                <div
                  className={clsx('flex flex-1 w-[36px] h-[31px] relative', {
                    'opacity-50': isExpired,
                  })}
                >
                  <Image
                    src="https://cdn.tmrwdao.com/assets/imgs/42A93D7BCC04.webp"
                    fill
                    alt="Community Post"
                  />
                </div>
                <div
                  className={clsx('flex flex-[6] flex-col gap-[7px]', {
                    'opacity-50': isExpired,
                  })}
                >
                  {proposalTitle !== undefined ? (
                    <span className="text-[#E0E0E0]">{proposalTitle}</span>
                  ) : (
                    <div data-testid="proposal-title-testId" className="flex flex-col gap-[3px]">
                      <div className="h-3 bg-[#353535] w-4/5 rounded animate-pulse" />
                      <div className="h-3 bg-[#353535] w-2/5 rounded animate-pulse" />
                    </div>
                  )}
                  <div className="flex gap-[7px] items-center">
                    <Vote className="text-[16px] text-[#9A9A9A]" />
                    {totalVoteAmount !== undefined ? (
                      <span className="text-[#51FF00]">{totalVoteAmount}</span>
                    ) : (
                      <div
                        data-testid="proposal-vote-testId"
                        className="h-3 bg-[#353535] w-1/5 rounded animate-pulse"
                      />
                    )}
                  </div>
                </div>
                <ChevronRight className="flex-1 text-white text-[16px]" />
              </div>
            );
          },
        )}
      </div>
      <div
        className={clsx('flex mb-[14px]', {
          'pb-[150px]': !hasMoreCommunity,
        })}
      >
        <button
          onClick={handleCreateVote}
          className="bg-[#5222D8] w-full h-8 border-0 text-white items-center justify-center flex gap-[6px] rounded-[10px]"
        >
          <Add /> Create Poll
        </button>
      </div>
    </div>
  );
};

export default CommunityList;
