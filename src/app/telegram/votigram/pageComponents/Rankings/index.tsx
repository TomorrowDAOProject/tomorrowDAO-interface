import Image from 'next/image';
import { useConfig } from 'components/CmsGlobalConfig/type';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import CommonDrawer, { ICommonDrawerRef } from '../../components/CommonDrawer';
import MyPoints from '../../components/MyPoints';
import { getRankingDetail, getRankings, getTaskList, updateTGInfo } from 'api/request';
import { curChain } from 'config';
import VoteList from '../VoteList';
import { RANKING_LABEL_KEY, RANKING_TYPE_KEY } from 'constants/ranking';
import { CreateVote } from '../CreateVote';
import AdsGram, { IAdsGramRef } from '../../components/AdsGram';

import Header from '../../components/Header';
import TrendingList from '../../components/TrendingList';
import CommunityList from '../../components/CommunityList';

import './index.css';
import { useUrlPath } from 'hooks/useUrlPath';

const TRENDING_ROW_COUNT = 3;
const COMMUNITY_ROW_COUNT = 3;

type ItemClickParams = {
  proposalId: string;
  proposalTitle: string;
  isGold: boolean;
};

interface IFetchResult {
  list: IRankingsItem[];
  hasData: boolean;
  totalPoints: number;
}
export interface IRankingsRef {
  openDetailWithProposalId: (proposalId: string) => void;
}

interface IRankingsProps {
  toggleNewListDrawerOpen?: () => void;
}

const Rankings = forwardRef<IRankingsRef, IRankingsProps>((props, ref) => {
  const adsGramRef = useRef<IAdsGramRef>(null);
  const pointsDrawerRef = useRef<ICommonDrawerRef>(null);
  const detailDrawerRef = useRef<ICommonDrawerRef>(null);
  const createVoteDrawerRef = useRef<ICommonDrawerRef>(null);
  const [hasCompletedAds, setHasCompletedAds] = useState(false);
  const [accountBalance, setAccountBalance] = useState(0);
  const [selectedItem, setSelectedItem] = useState<ItemClickParams | null>(null);
  const [trendingList, setTrendingList] = useState<IRankingsItem[]>(new Array(3).fill({}));
  const [communityList, setCommunityList] = useState<IRankingsItem[]>(new Array(3).fill({}));
  const [hasMoreTrending, setHasMoreTrending] = useState(false);
  const [hasMoreCommunity, setHasMoreCommunity] = useState(false);
  const { createVotePageTitle, rankingAdsBannerUrl } = useConfig() ?? {};
  const { isTelegram } = useUrlPath();

  const onItemClick = (item: ItemClickParams) => {
    setSelectedItem(item);
    detailDrawerRef.current?.open();
  };

  const backToPrevHandler = () => {
    detailDrawerRef.current?.close();
  };

  const fetchTaskList = async (): Promise<boolean> => {
    try {
      const result = await getTaskList({
        chainId: curChain,
      });
      const hasCompleteAds = result.data.taskList
        .find((item) => item.userTask == 'Daily')
        ?.data.find((item) => item.userTaskDetail === 'DailyViewAds')?.complete;
      return hasCompleteAds || false;
    } catch (error) {
      return false;
    }
  };

  // Generalized function to fetch rankings with different types and configurations
  const fetchRankings = async (
    type: number,
    skipCount: number,
    maxResultCount: number,
    isShowMore: boolean,
  ) => {
    try {
      const result = await getRankings({
        chainId: curChain,
        type,
        skipCount,
        maxResultCount,
        isShowMore,
      });
      return {
        list: result?.data?.data || [],
        userTotalPoints: result?.data?.userTotalPoints || 0,
        hasMoreData: skipCount + result?.data?.data.length < result.data?.totalCount,
      };
    } catch (error) {
      console.error(`Failed to fetch rankings of type ${type}`, error);
      return {};
    }
  };

  const initialize = async () => {
    try {
      const { first_name, last_name, photo_url, username, id } =
        window?.Telegram?.WebApp?.initDataUnsafe.user || {};

      const [communityData, trendingData] = await Promise.all([
        fetchRankings(RANKING_TYPE_KEY.COMMUNITY, 0, COMMUNITY_ROW_COUNT, false),
        fetchRankings(RANKING_TYPE_KEY.TRENDING, 0, TRENDING_ROW_COUNT, false),
        isTelegram &&
          updateTGInfo({
            telegramId: id.toString(),
            chainId: curChain,
            firstName: first_name,
            lastName: last_name,
            userName: username,
            icon: photo_url,
          }),
      ]);
      const completed = await fetchTaskList();
      setHasCompletedAds(completed);
      setHasMoreCommunity(!!communityData.hasMoreData);
      setCommunityList(communityData.list || []);
      setHasMoreTrending(!!trendingData.hasMoreData);
      setTrendingList(trendingData.list || []);
      setAccountBalance(trendingData?.userTotalPoints || 0);
    } catch (error) {
      console.error('Initialization failed', error);
    }
  };

  const onShowMoreCommunityClick = async () => {
    const newCommunityData = await fetchRankings(
      RANKING_TYPE_KEY.COMMUNITY,
      communityList.length,
      COMMUNITY_ROW_COUNT,
      true,
    );
    setHasMoreCommunity(!!newCommunityData.hasMoreData);
    setCommunityList((prevList) => [...prevList, ...(newCommunityData?.list || [])]);
  };

  const onShowMoreTrendingClick = async () => {
    const newTrendingData = await fetchRankings(
      RANKING_TYPE_KEY.TRENDING,
      trendingList.length,
      TRENDING_ROW_COUNT,
      true,
    );
    setHasMoreTrending(!!newTrendingData.hasMoreData);
    setTrendingList((prevList) => [...prevList, ...(newTrendingData?.list || [])]);
  };

  const fetchRankDetail = async (proposalId: string) => {
    const { data } = await getRankingDetail({
      chainId: curChain,
      proposalId,
    });
    onItemClick({
      proposalId,
      proposalTitle: data?.proposalTitle,
      isGold: data?.labelType === RANKING_LABEL_KEY.GOLD,
    });
  };

  useEffect(() => {
    initialize();
  }, []);

  const handleCreateVote = () => {
    createVoteDrawerRef.current?.open();
  };
  const openDetailWithProposalId = (proposalId: string) => {
    if (proposalId) {
      fetchRankDetail(proposalId);
    }
  };
  useImperativeHandle(ref, () => ({
    openDetailWithProposalId,
  }));

  return (
    <>
      <div className="ranking-container h-screen overflow-y-auto">
        <Header
          points={accountBalance}
          hasCompletedAds={hasCompletedAds}
          onPointsClick={() => {
            pointsDrawerRef.current?.open();
          }}
          onAdsVideoClick={() => {
            adsGramRef?.current?.showAd();
          }}
        />
        <div className="ranking-content">
          <div className="flex text-[40px] leading-[37px] text-white font-[860] px-4 pt-[18px] pb-[28px]">
            <span className="!font-sf-pro leading-[34px]">
              YOUR VOTE, <br />
              YOUR CHOICE
            </span>
          </div>
          <TrendingList data={trendingList} onItemClick={onItemClick} />
          {hasMoreTrending && (
            <div className="flex justify-center mt-[15px]" onClick={onShowMoreTrendingClick}>
              <span className="underline text-white">See More</span>
            </div>
          )}
          {!hasCompletedAds && rankingAdsBannerUrl && (
            <div
              className="flex px-4 py-7"
              onClick={() => {
                adsGramRef?.current?.showAd();
              }}
            >
              <div className="flex w-full h-[72px] relative overflow-hidden rounded-lg">
                <Image src={rankingAdsBannerUrl} fill alt="Ads Banner" priority />
              </div>
            </div>
          )}
          <CommunityList
            data={communityList}
            onItemClick={onItemClick}
            handleCreateVote={handleCreateVote}
            hasMoreCommunity={hasMoreCommunity}
          />
          {hasMoreCommunity && (
            <div className="flex justify-center pb-[150px]" onClick={onShowMoreCommunityClick}>
              <span className="underline text-white">See More</span>
            </div>
          )}
        </div>
      </div>
      <AdsGram
        ref={adsGramRef}
        onCustomReward={(newPoints: number) => {
          setAccountBalance(newPoints);
        }}
      />
      <CommonDrawer
        title="My Points"
        ref={pointsDrawerRef}
        drawerProps={{
          destroyOnClose: true,
        }}
        bodyClassname="my-points-drawer"
        body={<MyPoints />}
      />
      <AdsGram
        ref={adsGramRef}
        onCustomReward={(newPoints: number) => {
          setAccountBalance(newPoints);
        }}
      />
      <CommonDrawer
        ref={detailDrawerRef}
        showCloseTarget={false}
        showLeftArrow={false}
        headerClassname="!hidden"
        bodyClassname="discover-app-detail-drawer"
        drawerProps={{
          destroyOnClose: true,
          push: false,
        }}
        showCloseIcon={false}
        body={
          <div className="h-full">
            <VoteList
              backToPrev={backToPrevHandler}
              proposalId={selectedItem?.proposalId || ''}
              isGold={selectedItem?.isGold || false}
              detailTitle={selectedItem?.proposalTitle || ''}
            />
          </div>
        }
      />
      <CommonDrawer
        title={
          <span>
            <Image
              src="/images/tg/magic-wand.png"
              width={20}
              height={20}
              alt="page-title"
              className="pr-1"
            />
            {createVotePageTitle}
          </span>
        }
        ref={createVoteDrawerRef}
        drawerProps={{
          destroyOnClose: true,
          placement: 'right',
          width: '100%',
          push: false,
        }}
        showCloseIcon={false}
        showLeftArrow
        rootClassName="create-vote-drawer-root"
        bodyClassname="create-vote-drawer"
        body={
          <div>
            <CreateVote
              closeCreateForm={() => {
                createVoteDrawerRef.current?.close();
              }}
            />
          </div>
        }
      />
    </>
  );
});

export default Rankings;
