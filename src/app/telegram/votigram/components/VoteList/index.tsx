import Image from 'next/image';
import CommonDrawer, { ICommonDrawerRef } from '../CommonDrawer';
import VoteItem from '../VoteItem';
import './index.css';
import { Button } from 'antd';
import { useRef, useState } from 'react';
import Empty from '../Empty';
import { getRankingList, rankingVote } from 'api/request';
import { curChain, rpcUrlTDVW, sideChainCAContractAddress, voteAddress } from 'config';
import { useRequest } from 'ahooks';
import { getRawTransaction } from 'utils/transaction';
import { useWebLogin } from 'aelf-web-login';
import { EVoteOption } from 'types/vote';
const arr = new Array(1).fill(0);
const noop = async () => {
  //
};
export default function VoteList() {
  const confirmDrawerRef = useRef<ICommonDrawerRef>(null);
  const loadingDrawerRef = useRef<ICommonDrawerRef>(null);
  const retryDrawerRef = useRef<ICommonDrawerRef>(null);
  // const [isLoading, setIsLoading] = useState(true);
  const [currentVoteItem, setCurrentVoteItem] = useState<IRankingListResItem | null>(null);
  const retryFn = useRef<() => Promise<void>>();
  const {
    data: rankList,
    error: rankListError,
    loading: rankListLoading,
  } = useRequest(async () => {
    return getRankingList({ chainId: curChain });
  });
  const { wallet, walletType } = useWebLogin();
  const requestVoteStatus = async () => {
    // setIsLoading(true);
    retryFn.current = requestVoteStatus;
    // setIsLoading(false);
    retryFn.current = noop;
  };
  const sendRawTransaction = async () => {
    confirmDrawerRef.current?.close();
    retryDrawerRef.current?.close();
    loadingDrawerRef.current?.open();
    const handleError = () => {
      retryFn.current = sendRawTransaction;
      retryDrawerRef.current?.open();
    };

    try {
      const rawTransaction = await getRawTransaction({
        walletInfo: wallet,
        contractAddress: voteAddress,
        caContractAddress: sideChainCAContractAddress,
        methodName: 'Vote',
        walletType: walletType,
        params: {
          votingItemId: currentVoteItem?.proposalId,
          voteOption: EVoteOption.APPROVED,
          voteAmount: 1,
          memo: `##GameRanking:{${currentVoteItem?.alias}}`,
        },
        rpcUrl: rpcUrlTDVW,
        chainId: curChain,
      });
      if (rawTransaction) {
        let voteRes = await rankingVote({
          chainId: curChain,
          rawTransaction: rawTransaction,
        });
      }
    } catch (error) {
      handleError();
    }
    // setIsLoading(true);
  };

  return (
    <div className="votigram-main">
      <div className="banner">
        <img src={'/images/tg/vote-list-top-banner.png'} height={'100%'} width={'100%'} alt={''} />
      </div>
      <div className="votigram-activity-title">
        <h3>Vote your favorite game</h3>
        <div className="votigram-activity-rest font-14-18">Reset in: 12:34:57</div>
      </div>
      <div className="vote-lists">
        {rankList?.data?.rankingList.map((item, index) => {
          return (
            <VoteItem
              key={index}
              index={index}
              item={item}
              onVote={(item: IRankingListResItem) => {
                console.log('vote item clicked');
                setCurrentVoteItem(item);
                confirmDrawerRef.current?.open();
              }}
            />
          );
        })}
      </div>
      {rankList && rankList?.data?.rankingList?.length === 0 && (
        <Empty
          style={{
            // eslint-disable-next-line no-inline-styles/no-inline-styles
            height: 443,
          }}
          imageUrl="/images/tg/empty-vote-list.png"
          title="No Active Voting Right Now"
          description="There’s no voting event at the moment. Check back soon to join the next one and make your vote count!"
        />
      )}

      <CommonDrawer
        title="Confirm Your Vote"
        ref={confirmDrawerRef}
        body={
          <div className="flex flex-col items-center">
            <img
              src={currentVoteItem?.icon}
              className="vote-item-icon"
              alt="vote-confirm"
              width={64}
              height={64}
            />
            <h3 className="font-16-20-weight text-[#EDEEF0] mt-[8px] mb-[16px]">
              {currentVoteItem?.title}
            </h3>
            <p className="font-14-18">Are you sure you want to vote for this game?</p>
            <Button type="primary" onClick={sendRawTransaction}>
              Confirm
            </Button>
          </div>
        }
      />

      <CommonDrawer
        title="Vote Registration Failed"
        ref={retryDrawerRef}
        body={
          <div className="flex flex-col items-center">
            <div className="drawer-retry-icon-wrap">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M16 3C13.4288 3 10.9154 3.76244 8.77759 5.1909C6.63975 6.61935 4.97351 8.64968 3.98957 11.0251C3.00563 13.4006 2.74819 16.0144 3.2498 18.5362C3.75141 21.0579 4.98953 23.3743 6.80762 25.1924C8.6257 27.0105 10.9421 28.2486 13.4638 28.7502C15.9856 29.2518 18.5995 28.9944 20.9749 28.0104C23.3503 27.0265 25.3807 25.3603 26.8091 23.2224C28.2376 21.0846 29 18.5712 29 16C28.9964 12.5533 27.6256 9.24882 25.1884 6.81163C22.7512 4.37445 19.4467 3.00364 16 3ZM16 27C13.8244 27 11.6977 26.3549 9.88873 25.1462C8.07979 23.9375 6.66989 22.2195 5.83733 20.2095C5.00477 18.1995 4.78693 15.9878 5.21137 13.854C5.63581 11.7202 6.68345 9.7602 8.22183 8.22183C9.76021 6.68345 11.7202 5.6358 13.854 5.21136C15.9878 4.78692 18.1995 5.00476 20.2095 5.83733C22.2195 6.66989 23.9375 8.07979 25.1462 9.88873C26.3549 11.6977 27 13.8244 27 16C26.9967 18.9164 25.8367 21.7123 23.7745 23.7745C21.7123 25.8367 18.9164 26.9967 16 27ZM10 13.5C10 13.2033 10.088 12.9133 10.2528 12.6666C10.4176 12.42 10.6519 12.2277 10.926 12.1142C11.2001 12.0006 11.5017 11.9709 11.7926 12.0288C12.0836 12.0867 12.3509 12.2296 12.5607 12.4393C12.7704 12.6491 12.9133 12.9164 12.9712 13.2074C13.0291 13.4983 12.9994 13.7999 12.8858 14.074C12.7723 14.3481 12.58 14.5824 12.3334 14.7472C12.0867 14.912 11.7967 15 11.5 15C11.1022 15 10.7206 14.842 10.4393 14.5607C10.158 14.2794 10 13.8978 10 13.5ZM22 13.5C22 13.7967 21.912 14.0867 21.7472 14.3334C21.5824 14.58 21.3481 14.7723 21.074 14.8858C20.7999 14.9994 20.4983 15.0291 20.2074 14.9712C19.9164 14.9133 19.6491 14.7704 19.4393 14.5607C19.2296 14.3509 19.0867 14.0836 19.0288 13.7926C18.971 13.5017 19.0007 13.2001 19.1142 12.926C19.2277 12.6519 19.42 12.4176 19.6667 12.2528C19.9133 12.088 20.2033 12 20.5 12C20.8978 12 21.2794 12.158 21.5607 12.4393C21.842 12.7206 22 13.1022 22 13.5ZM21.865 21.5C21.9374 21.6138 21.9859 21.7411 22.0078 21.8742C22.0297 22.0073 22.0245 22.1434 21.9924 22.2744C21.9603 22.4054 21.902 22.5285 21.8211 22.6364C21.7402 22.7443 21.6383 22.8348 21.5215 22.9022C21.4048 22.9697 21.2756 23.0129 21.1417 23.0292C21.0078 23.0454 20.872 23.0345 20.7425 22.9969C20.6129 22.9593 20.4924 22.8959 20.388 22.8105C20.2836 22.7251 20.1975 22.6195 20.135 22.5C19.2013 20.8862 17.7338 20 16 20C14.2663 20 12.7988 20.8875 11.865 22.5C11.8025 22.6195 11.7164 22.7251 11.6121 22.8105C11.5077 22.8959 11.3871 22.9593 11.2575 22.9969C11.128 23.0345 10.9922 23.0454 10.8583 23.0292C10.7245 23.0129 10.5952 22.9697 10.4785 22.9022C10.3617 22.8348 10.2598 22.7443 10.1789 22.6364C10.098 22.5285 10.0397 22.4054 10.0076 22.2744C9.97555 22.1434 9.97029 22.0073 9.99218 21.8742C10.0141 21.7411 10.0627 21.6138 10.135 21.5C11.4213 19.2762 13.5588 18 16 18C18.4413 18 20.5788 19.275 21.865 21.5Z"
                  fill="#B1B3BC"
                />
              </svg>
            </div>
            <p className="font-14-18 mt-[24px] text-center">
              Something went wrong while registering your vote on chain. Please try again.
            </p>
            <Button
              type="primary"
              onClick={() => {
                if (retryFn.current) {
                  retryFn.current();
                }
              }}
            >
              Retry
            </Button>
          </div>
        }
      />
      <CommonDrawer
        title="Registering Your Vote"
        ref={loadingDrawerRef}
        body={
          <div className="flex flex-col items-center">
            <div className="circular-progress">
              <Image
                src="/images/tg/circular-progress.png"
                alt="vote-confirm"
                width={56}
                height={56}
              />
            </div>

            <p className="font-14-18 mt-[24px] text-center">
              Please wait while your vote is securely registered on chain.
            </p>
          </div>
        }
      />
    </div>
  );
}