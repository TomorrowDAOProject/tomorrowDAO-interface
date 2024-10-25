import BigNumber from 'bignumber.js';
import { ReactComponent as Official } from 'assets/icons/official.svg';
import { ReactComponent as Community } from 'assets/icons/community.svg';
import { ReactComponent as ChevronRight } from 'assets/icons/chevron-right.svg';
import { ReactComponent as Add } from 'assets/icons/add.svg';
import { useConfig } from 'components/CmsGlobalConfig/type';
import { useEffect, useMemo, useRef, useState } from 'react';
import CommonDrawer, { ICommonDrawerRef } from '../../components/CommonDrawer';
import MyPoints from '../../components/MyPoints';
import { getRankingDetail, getRankings } from 'api/request';
import { curChain } from 'config';
import { useInfiniteScroll } from 'ahooks';
import Loading from '../../components/Loading';
import VoteList from '../VoteList';
import { Button } from 'antd';
import RankItem from './RankItem';
import clsx from 'clsx';
import BannerList from './BannerList';
import { RANKING_LABEL_KEY, RANKING_TYPE_KEY } from 'constants/ranking';
import { CreateVote } from '../CreateVote';

import './index.css';
import { TelegramPlatform } from '@portkey/did-ui-react';
import { parseStartAppParams } from '../../util/start-params';

const OFFICIAL_ROW_COUNT = 3;
const COMMUNITY_ROW_COUNT = 10;
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

const Rankings: React.FC = () => {
  const pointsDrawerRef = useRef<ICommonDrawerRef>(null);
  const detailDrawerRef = useRef<ICommonDrawerRef>(null);
  const createVoteDrawerRef = useRef<ICommonDrawerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [accountBalance, setAccountBalance] = useState(0);
  const [selectedItem, setSelectedItem] = useState<ItemClickParams | null>(null);
  const [bannerList, setBannerList] = useState<IRankingsItem[]>([]);
  const [officialList, setOfficialList] = useState<IRankingsItem[]>([]);
  const [hasMoreOfficial, setHasMoreOfficial] = useState(false);
  const { createVotePageTitle } = useConfig() ?? {};

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

  // Fetch function for community rankings, now using a consistent structure
  const fetchCommunityRankings: (data?: IFetchResult) => Promise<IFetchResult> = async (data) => {
    const prevList = data?.list ?? [];
    try {
      const res = await getRankings({
        chainId: curChain,
        type: RANKING_TYPE_KEY.COMMUNITY,
        skipCount: prevList.length,
        maxResultCount: COMMUNITY_ROW_COUNT,
      });
      const currentList = res?.data?.data ?? [];
      const len = currentList.length + prevList.length;

      return {
        list: currentList,
        totalPoints: res?.data?.userTotalPoints ?? 0,
        hasData: len < res.data?.totalCount,
      };
    } catch (error) {
      console.error('Failed to fetch community rankings', error);
      return {
        list: prevList,
        totalPoints: 0,
        hasData: false,
      };
    }
  };

  const initialize = async () => {
    try {
      const [officialData, bannerData] = await Promise.all([
        fetchRankings(RANKING_TYPE_KEY.OFFICIAL, 0, OFFICIAL_ROW_COUNT),
        fetchRankings(RANKING_TYPE_KEY.TOP_BANNER, 0, BANNER_ROW_COUNT),
      ]);

      setHasMoreOfficial(!!officialData.hasMoreData);
      setAccountBalance(officialData?.userTotalPoints || 0);
      setOfficialList(officialData.list || []);
      setBannerList(bannerData.list || []);
    } catch (error) {
      console.error('Initialization failed', error);
    }
  };

  const onShowMoreClick = async () => {
    const newOfficialData = await fetchRankings(
      RANKING_TYPE_KEY.OFFICIAL,
      officialList.length,
      OFFICIAL_ROW_COUNT,
    );
    setHasMoreOfficial(!!newOfficialData.hasMoreData);
    setOfficialList((prevList) => [...prevList, ...(newOfficialData?.list || [])]);
  };

  // Infinite scroll setup for community rankings
  const {
    data: communityList,
    loadingMore,
    loading,
    noMore,
  } = useInfiniteScroll(fetchCommunityRankings, {
    target: containerRef,
    isNoMore: (d) => !d?.hasData || d.list.length === 0,
  });

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

  useEffect(() => {
    const startParam = TelegramPlatform.getInitData()?.start_param ?? '';
    const params = parseStartAppParams(startParam);
    if (params) {
      fetchRankDetail(params.pid || '');
    }
  }, []);

  const handleCreateVote = () => {
    createVoteDrawerRef.current?.open();
  };

  const needLoading = loading || loadingMore;

  return (
    <div className="px-4 bg-black h-screen text-white overflow-y-auto" ref={containerRef}>
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
            New List
          </Button>
        </div>
      </div>
      {bannerList && bannerList.length > 0 && (
        <div className="flex">
          <BannerList
            bannerList={bannerList}
            onClick={({ proposalId, proposalTitle, labelType }) => {
              onItemClick({
                isGold: labelType === RANKING_LABEL_KEY.GOLD,
                proposalId,
                proposalTitle,
              });
            }}
          />
        </div>
      )}

      <div className="flex flex-col border-0 border-b border-[#1B1B1B] border-solid">
        <span className="text-base items-center flex my-4">
          <Official className="text-xl mr-1" />
          Official List
        </span>
        <div className="flex flex-col gap-4">
          {officialList?.map((item) => (
            <RankItem key={item.proposalId} {...item} onItemClick={onItemClick} />
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
      <div className="flex flex-col">
        <span className="text-base items-center flex my-4">
          <Community className="text-xl mr-1" />
          Community List
        </span>
        <div className="flex flex-col gap-4">
          {communityList?.list?.map((item) => (
            <RankItem key={item.proposalId} {...item} onItemClick={onItemClick} />
          ))}
          {needLoading && (
            <div
              className={clsx('flex-center', {
                'mt-[100px]': loading,
              })}
            >
              <Loading />
            </div>
          )}
        </div>
        {noMore && !needLoading && (
          <div className="font-normal text-xs mt-6 py-8 text-[#616161] text-center">
            You have reached the bottom of the page.
          </div>
        )}
      </div>
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
        title={<span>{createVotePageTitle}</span>}
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
};

export default Rankings;
