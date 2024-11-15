import BigNumber from 'bignumber.js';
import Image from 'next/image';
import { ReactComponent as Official } from 'assets/icons/official.svg';
import { ReactComponent as Community } from 'assets/icons/community.svg';
import { ReactComponent as ChevronRight } from 'assets/icons/chevron-right.svg';
import { ReactComponent as Add } from 'assets/icons/add.svg';
import { useConfig } from 'components/CmsGlobalConfig/type';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import CommonDrawer, { ICommonDrawerRef } from '../../components/CommonDrawer';
import MyPoints from '../../components/MyPoints';
import { getRankingDetail, getRankings, getTaskList } from 'api/request';
import { curChain } from 'config';
import VoteList from '../VoteList';
import { Button } from 'antd';
import RankItem from './RankItem';
import { RANKING_LABEL_KEY, RANKING_TYPE_KEY } from 'constants/ranking';
import { CreateVote } from '../CreateVote';

import OfficialItem from './OfficialItem';
import AdsGram, { IAdsGramRef } from '../../components/AdsGram';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasCompletedAds, setHasCompletedAds] = useState(true);
  const [accountBalance, setAccountBalance] = useState(0);
  const [selectedItem, setSelectedItem] = useState<ItemClickParams | null>(null);
  const [bannerList, setBannerList] = useState<IRankingsItem[]>([]);
  const [officialList, setOfficialList] = useState<IRankingsItem[]>([]);
  const [communityList, setCommunityList] = useState<IRankingsItem[]>([]);
  const [hasMoreOfficial, setHasMoreOfficial] = useState(false);
  const [hasMoreCommunity, setHasMoreCommunity] = useState(false);
  const { createVotePageTitle, rankingAdsBannerUrl } = useConfig() ?? {};

  const renderPointsStr = useMemo(() => {
    return BigNumber(accountBalance ?? 0).toFormat();
  }, [accountBalance]);

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

  const onShowMoreClick = async () => {
    const newOfficialData = await fetchRankings(
      RANKING_TYPE_KEY.TRENDING,
      officialList.length,
      OFFICIAL_ROW_COUNT,
    );
    setHasMoreOfficial(!!newOfficialData.hasMoreData);
    setOfficialList((prevList) => [...prevList, ...(newOfficialData?.list || [])]);
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
    <div className="h-screen overflow-y-auto">
      <div className="px-4 bg-black text-white">
        <div className="flex py-4">
          <div className="flex flex-col flex-1 gap-1">
            <span
              className="flex items-center"
              onClick={() => {
                pointsDrawerRef.current?.open();
              }}
            >
              Total points earned
              <ChevronRight className="ml-1 text-base" />
            </span>
            <span className="font-18-22-weight text-[#51FF00]">{renderPointsStr}</span>
          </div>
          <div className="flex flex-1 items-center justify-end">
            <Button
              className="!text-sm !h-8 !rounded-lg !font-medium items-center gap-[6px] flex"
              type="primary"
              onClick={handleCreateVote}
            >
              <Add className="text-sm" />
              Create Poll
            </Button>
          </div>
        </div>
      </div>
      {!hasCompletedAds && (
        <img
          src={rankingAdsBannerUrl}
          className="w-full"
          onClick={() => {
            adsGramRef?.current?.showAd();
          }}
          alt="ads banner"
        />
      )}

      <div className="px-4 bg-black text-white" ref={containerRef}>
        <div className="flex flex-col border-0 border-b border-[#1B1B1B] border-solid">
          <span className="text-base items-center flex my-4">
            <Official className="text-xl mr-1" />
            Trending
          </span>
          <div className="flex flex-col gap-4">
            {officialList?.map((item) => (
              <OfficialItem key={item.proposalId} {...item} onItemClick={onItemClick} />
            ))}
          </div>
          {hasMoreOfficial && (
            <div className="flex justify-center items-center my-4">
              <span className="text-[#ACA6FF] text-xs flex items-center" onClick={onShowMoreClick}>
                Show More
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col pb-32">
          <span className="text-base items-center flex my-4">
            <Community className="text-xl mr-1" />
            Community
          </span>
          <div className="flex flex-col gap-4">
            {communityList?.map((item) => (
              <RankItem key={item.proposalId} {...item} onItemClick={onItemClick} />
            ))}
          </div>
          {hasMoreCommunity && (
            <div className="flex justify-center items-center my-4">
              <span
                className="text-[#ACA6FF] text-xs flex items-center"
                onClick={onShowMoreCommunityClick}
              >
                Show More
              </span>
            </div>
          )}
          {/* {noMore && !needLoading && (
            <div className="font-normal text-xs mt-6 py-8 text-[#616161] text-center">
              You have reached the bottom of the page.
            </div>
          )} */}
        </div>
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
          title="My Points"
          ref={pointsDrawerRef}
          drawerProps={{
            destroyOnClose: true,
          }}
          bodyClassname="my-points-drawer"
          body={<MyPoints />}
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
      </div>
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
        title="My Points"
        ref={pointsDrawerRef}
        drawerProps={{
          destroyOnClose: true,
        }}
        bodyClassname="my-points-drawer"
        body={<MyPoints />}
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
    </div>
  );
});

export default Rankings;
