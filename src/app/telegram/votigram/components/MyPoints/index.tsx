import { CheckCircleOutlined } from '@aelf-design/icons';
import Empty from '../Empty';
import { fetchVoteHistory, getRankPoints } from 'api/request';
import { useInfiniteScroll } from 'ahooks';
import { curChain } from 'config';
import { useEffect, useMemo } from 'react';
import Refresh from '../Refresh';
import './index.css';
import BigNumber from 'bignumber.js';
import Loading from '../Loading';
import { IPonitType } from '../../type';
import dayjs from 'dayjs';

const MaxResultCount = 5;
interface IFetchResult {
  list: IGetRankPointsResItem[];
  hasData: boolean;
  totalPoints: number;
}
const getPonitDescription = (item: IGetRankPointsResItem) => {
  if (item.pointsType === IPonitType.TopInviter) {
    const [start, end] = item.description.split('-');
    const startNumber = Number(start);
    const endNumber = Number(end);
    const startMMDD = dayjs(startNumber).format('MM.DD');
    const endMMDD = dayjs(endNumber).format('MM.DD');
    return `Cycle: ${startMMDD}-${endMMDD}`;
  }
  return item.description;
};
export default function MyPoints() {
  // const fetchVoteList: (data?: IFetchResult) => Promise<IFetchResult> = async (data) => {
  //   const preList = data?.list ?? [];
  //   const res = await fetchVoteHistory({
  //     address: wallet.address,
  //     chainId: curChain,
  //     skipCount: preList.length,
  //     maxResultCount: MaxResultCount,
  //     source: 'Telegram',
  //   });
  //   const currentList = res?.data?.items ?? [];
  //   const len = currentList.length + preList.length;
  //   return {
  //     list: currentList,
  //     totalPoints: res?.data?.totalPoints ?? 0,
  //     hasData: len < res.data?.totalCount,
  //   };
  // };
  const fetchVoteList: (data?: IFetchResult) => Promise<IFetchResult> = async (data) => {
    const preList = data?.list ?? [];
    const res = await getRankPoints({
      chainId: curChain,
      skipCount: preList.length,
      maxResultCount: MaxResultCount,
    });
    const currentList = res?.data?.items ?? [];
    const len = currentList.length + preList.length;
    return {
      list: currentList,
      totalPoints: res?.data?.totalPoints ?? 0,
      hasData: len < res.data?.totalCount,
    };
  };
  const {
    data: voteListData,
    loadingMore: voteListLoadingMore,
    loadMore: voteListLoadMore,
    loading: voteListLoading,
    reload: voteListReload,
  } = useInfiniteScroll(fetchVoteList, { manual: true });
  useEffect(() => {
    voteListReload();
  }, []);
  const totlePoints = useMemo(() => {
    return BigNumber(voteListData?.totalPoints ?? 0).toFormat();
  }, [voteListData?.totalPoints]);
  return (
    <div className="my-point-wrap">
      <div className="header">
        <p className="font-14-18-weight">
          Total earned: <span className="amount">{totlePoints}</span>
        </p>
      </div>
      {voteListLoading ? (
        <div className="votigram-loading-wrap">
          <Loading />
        </div>
      ) : (
        <>
          {(voteListData?.list?.length ?? 0) > 0 && (
            <ul className="point-list">
              {voteListData?.list.map((item, i) => {
                return (
                  <li className="point-list-item py-3" key={i}>
                    <div className="wrap1 truncate">
                      <CheckCircleOutlined />
                      <div className="body truncate">
                        <h3 className="font-17-22 truncate">{item.title}</h3>
                        <p className="font-15-20 mb-0.5 truncate">{getPonitDescription(item)}</p>
                        <span className="text-[13px] leading-4">
                          {dayjs(item.pointsTime).format('YYYY.MM.DD HH:mm')}
                        </span>
                      </div>
                    </div>
                    <p className="amount font-18-22-weight">
                      {BigNumber(item?.points ?? 0).toFormat()}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {voteListData?.hasData && (
        <div className="show-more-button-wrap">
          <div className="show-more-button-wrap-button" onClick={voteListLoadMore}>
            <Refresh isLoading={voteListLoadingMore} />
            <span className="font-17-22 font-[590]">Show more</span>
          </div>
        </div>
      )}

      {voteListData?.list?.length === 0 && (
        <Empty
          style={{
            // eslint-disable-next-line no-inline-styles/no-inline-styles
            height: 514,
          }}
          imageUrl="/images/tg/empty-points.png"
          title="No Points Yet"
          description="You haven’t voted yet. Start voting to earn points and unlock rewards!"
        />
      )}
    </div>
  );
}
