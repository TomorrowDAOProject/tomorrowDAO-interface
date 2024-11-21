import Image from 'next/image';
import { useConfig } from 'components/CmsGlobalConfig/type';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import CommonDrawer, { ICommonDrawerRef } from '../../components/CommonDrawer';
import MyPoints from '../../components/MyPoints';
import { getRankingDetail, getRankings, getTaskList } from 'api/request';
import { curChain } from 'config';
import VoteList from '../VoteList';
import { RANKING_LABEL_KEY, RANKING_TYPE_KEY } from 'constants/ranking';
import { CreateVote } from '../CreateVote';
import AdsGram, { IAdsGramRef } from '../../components/AdsGram';

import Header from '../../components/Header';
import OfficialList from '../../components/OfficialList';
import CommunityList from '../../components/CommunityList';

import './index.css';

import './index.css';

const OFFICIAL_ROW_COUNT = 3;
const COMMUNITY_ROW_COUNT = 3;
const BANNER_ROW_COUNT = 10;

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
  const [bannerList, setBannerList] = useState<IRankingsItem[]>([]);
  const [officialList, setOfficialList] = useState<IRankingsItem[]>(new Array(3).fill({}));
  const [communityList, setCommunityList] = useState<IRankingsItem[]>(new Array(3).fill({}));
  const [hasMoreOfficial, setHasMoreOfficial] = useState(false);
  const [hasMoreCommunity, setHasMoreCommunity] = useState(false);
  const { createVotePageTitle, rankingAdsBannerUrl } = useConfig() ?? {};

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
  const fetchRankings = async (type: number, skipCount: number, maxResultCount: number) => {
    try {
      const result = await getRankings({
        chainId: curChain,
        type,
        skipCount,
        maxResultCount,
      });
      return {
        list: result?.data?.data || [],
        userTotalPoints: result?.data?.userTotalPoints || 0,
        hasMoreData: skipCount < result.data?.totalCount,
      };
    } catch (error) {
      console.error(`Failed to fetch rankings of type ${type}`, error);
      return {};
    }
  };

  const initialize = async () => {
    try {
      const [communityData, officialData, bannerData] = await Promise.all([
        fetchRankings(RANKING_TYPE_KEY.COMMUNITY, 0, COMMUNITY_ROW_COUNT),
        fetchRankings(RANKING_TYPE_KEY.TRENDING, 0, OFFICIAL_ROW_COUNT),
        fetchRankings(RANKING_TYPE_KEY.TOP_BANNER, 0, BANNER_ROW_COUNT),
      ]);
      const completed = await fetchTaskList();
      setHasCompletedAds(completed);
      setHasMoreCommunity(!!communityData.hasMoreData);
      setCommunityList(communityData.list || []);
      setHasMoreOfficial(!!officialData.hasMoreData);
      setOfficialList(officialData.list || []);
      setAccountBalance(officialData?.userTotalPoints || 0);
      setBannerList(bannerData.list || []);
    } catch (error) {
      console.error('Initialization failed', error);
    }
  };

  const onShowMoreCommunityClick = async () => {
    const newCommunityData = await fetchRankings(
      RANKING_TYPE_KEY.COMMUNITY,
      communityList.length,
      COMMUNITY_ROW_COUNT,
    );
    setHasMoreCommunity(!!newCommunityData.hasMoreData);
    setCommunityList((prevList) => [...prevList, ...(newCommunityData?.list || [])]);
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
          <OfficialList data={officialList} onItemClick={onItemClick} />
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
          />
          <div className="flex justify-center pb-[150px]" onClick={onShowMoreCommunityClick}>
            <span className="underline text-white">See More</span>
          </div>
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
