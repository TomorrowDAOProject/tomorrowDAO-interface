import { RightOutlined } from '@aelf-design/icons';
import BigNumber from 'bignumber.js';
import { ReactComponent as Flower } from 'assets/imgs/badgeForRankings.svg';
import './index.css';
import { useMemo, useRef, useState } from 'react';
import CommonDrawer, { ICommonDrawerRef } from '../../components/CommonDrawer';
import MyPoints from '../../components/MyPoints';
import { getRankings } from 'api/request';
import { curChain } from 'config';
import { useInfiniteScroll } from 'ahooks';
import Loading from '../../components/Loading';
import { RankingTypeEnum, RankingLabelEnum } from './type';
import VoteList from '../VoteList';

const MaxResultCount = 10;

interface IFetchResult {
  list: IRankingsItem[];
  hasData: boolean;
  totalPoints: number;
}

const Badge = ({ text }: { text: string }) => {
  return (
    <div className="text-xs px-2 rounded-full border border-[#2D1F73] border-solid text-[#ACA6FF] text-center">
      {text}
    </div>
  );
};

const RankItem = ({ item }: { item: IRankingsItem }) => {
  return (
    <div className="rounded-2xl p-4 bg-[#1B1B1B] flex items-center active:bg-[#292929]">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4 w-full">
          <img src="/images/tg/ranking-icon.png" alt="rankings-icon" width={48} height={48} />
          <div className="flex flex-col w-full">
            <div className="flex overflow-hidden w-full">
              <h3 className="m-w-[72%] truncate text-base font-medium text-white mr-1">
                {item?.proposalTitle}
              </h3>
              <Flower
                className={`w-6 h-6 ${
                  item.labelType === RankingLabelEnum.Gold ? 'text-[#F4AC33]' : 'text-[#0395FF]'
                }`}
              />
            </div>
            <div className="flex items-center gap-2 pt-[2px]">
              <Badge
                text={item.rankingType === RankingTypeEnum.Official ? 'Official' : 'Community'}
              />
              <div className="text-sm leading-[18px] flex items-center gap-1">
                <div className="text-[#9A9A9A]">
                  <span>Total </span>
                  <span>Vote</span>
                </div>
                <span className="font-medium text-[#51FF00]">{item?.totalVoteAmount}</span>
              </div>
            </div>
          </div>
        </div>
        <RightOutlined className="!text-white text-base" />
      </div>
    </div>
  );
};
const Rankings: React.FC = () => {
  const pointsDrawerRef = useRef<ICommonDrawerRef>(null);
  const detailDrawerRef = useRef<ICommonDrawerRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [proposalId, setProposalId] = useState('');
  const [isGold, setIsGold] = useState(false);

  const fetchRankings: (data?: IFetchResult) => Promise<IFetchResult> = async (data) => {
    const preList = data?.list ?? [];
    const res = await getRankings({
      chainId: curChain,
      skipCount: preList.length,
      maxResultCount: MaxResultCount,
    });
    const currentList = res?.data?.data ?? [];
    const len = currentList.length + preList.length;
    return {
      list: currentList,
      totalPoints: res?.data?.userTotalPoints ?? 0,
      hasData: len < res.data?.totalCount,
    };
  };
  const {
    data: dataFromServer,
    loadingMore,
    loading,
    noMore,
  } = useInfiniteScroll(fetchRankings, {
    target: containerRef,
    isNoMore: (d) => !d?.hasData || d.list.length === 0,
  });

  const renderPointsStr = useMemo(() => {
    return BigNumber(dataFromServer?.totalPoints ?? 0).toFormat();
  }, [dataFromServer?.totalPoints]);

  const onClickHandler = (pid: string, isGold: boolean) => {
    setIsGold(isGold);
    setProposalId(pid);
    detailDrawerRef.current?.open();
  };

  const backToPrevHandler = () => {
    detailDrawerRef.current?.close();
  };

  const needLoading = loading || loadingMore;
  return (
    <div className="rankings-main" ref={containerRef}>
      <div className="py-[10px] gap-1 flex flex-col items-center justify-center rounded-2xl bg-[#221D51]">
        <div
          className="flex items-center gap-1"
          onClick={() => {
            pointsDrawerRef.current?.open();
          }}
        >
          <span className="font-14-18 text-white">Total points earned</span>
          <RightOutlined className="!text-white" />
        </div>
        <p className="font-18-22-weight text-[#51FF00]">{renderPointsStr}</p>
      </div>
      <div className="flex items-center gap-1 my-4">
        <Flower className="w-6 h-6 text-[#F4AC33]" />
        <div className="text-sm text-[#E0E0E0]">Hot</div>
      </div>
      <div>
        {dataFromServer?.list?.map((ele) => (
          <div
            key={ele.proposalId}
            className="mb-4"
            onClick={() => onClickHandler(ele.proposalId, ele.labelType === RankingLabelEnum.Gold)}
          >
            <RankItem item={ele} />
          </div>
        ))}
        {needLoading && (
          <div className={`${loading ? 'mt-[100px]' : ''} flex-center`}>
            <Loading />
          </div>
        )}
      </div>

      {noMore && !needLoading && (
        <div className="font-14-18-weight  mt-6 py-8 text-[#6A6D79] text-center">
          It has already reached the bottom.
        </div>
      )}

      <CommonDrawer
        title=""
        ref={detailDrawerRef}
        showCloseTarget={false}
        showLeftArrow={false}
        headerClassname="!hidden"
        bodyClassname="discover-app-detail-drawer"
        drawerProps={{
          destroyOnClose: true,
        }}
        showCloseIcon={false}
        body={
          <div className="h-full">
            <VoteList backToPrev={backToPrevHandler} proposalId={proposalId} isGold={isGold} />
          </div>
        }
      />

      <CommonDrawer
        title={`My Points`}
        ref={pointsDrawerRef}
        drawerProps={{
          destroyOnClose: true,
        }}
        bodyClassname="my-points-drawer"
        body={
          <div>
            <MyPoints />
          </div>
        }
      />
    </div>
  );
};

export default Rankings;
