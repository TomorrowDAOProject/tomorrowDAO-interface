'use client';
import React, { useEffect } from 'react';
import { Button } from 'aelf-design';
import { useInfiniteScroll } from 'ahooks';
import { fetchMyDaoList } from 'api/request';
import { curChain } from 'config';
import Link from 'next/link';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import LoadMoreButton from 'components/LoadMoreButton';
import { SkeletonDaoItemList } from 'components/Skeleton';
import './index.css';
import { EMyDAOType } from 'types/dao';
import NoData from 'components/NoData';
import useResponsive from 'hooks/useResponsive';
import { useWalletService } from 'hooks/useWallet';

const MaxResultCount = 5;
interface IFetchResult {
  list: IMyDaoListDataItem[];
  hasData: boolean;
}
const MyDaosPage = () => {
  const { walletInfo: wallet, connectWallet } = useConnectWallet();
  const { isLogin } = useWalletService();
  const fetchOwnDao: (data?: IFetchResult) => Promise<IFetchResult> = async (data) => {
    const preList = data?.list ?? [];
    const res = await fetchMyDaoList({
      Type: EMyDAOType.Owned,
      ChainId: curChain,
      SkipCount: preList.length,
      MaxResultCount,
    });
    const currentList = res?.data?.[0]?.list ?? [];
    const len = currentList.length + preList.length;
    return {
      list: currentList,
      hasData: len < res.data[0].totalCount,
    };
  };
  const wrapConnectCheck = (cb: () => void) => {
    if (!wallet?.address) {
      connectWallet();
      return;
    }
    cb();
  };
  const {
    data: ownData,
    loadingMore: ownLoadingMore,
    loadMore: ownLoadMore,
    loading: ownLoading,
    reload: ownReload,
  } = useInfiniteScroll(fetchOwnDao, { manual: true });
  const fetchParticipatedDao: (data?: IFetchResult) => Promise<IFetchResult> = async (data) => {
    const preList = data?.list ?? [];
    try {
      const res = await fetchMyDaoList({
        Type: EMyDAOType.Participated,
        ChainId: curChain,
        SkipCount: preList.length,
        MaxResultCount,
      });
      const currentList = res?.data?.[0]?.list ?? [];
      const len = currentList.length + preList.length;
      return {
        list: res.data[0].list,
        hasData: len < res.data[0].totalCount,
      };
    } catch (error) {
      console.log(error);
      return {
        list: [],
        hasData: false,
      };
    }
  };
  const {
    data: participatedData,
    loadingMore: participatedLoadingMore,
    loadMore: participatedLoadMore,
    loading: participatedLoading,
    reload: participatedReload,
  } = useInfiniteScroll(fetchParticipatedDao, { manual: true });
  useEffect(() => {
    if (wallet?.address && isLogin) {
      ownReload();
      participatedReload();
    }
  }, [ownReload, participatedReload, wallet?.address, isLogin]);
  const { isLG } = useResponsive();
  const EmptyNode = (
    <div className="flex flex-col items-center">
      <NoData></NoData>
      <Link href="/explore">
        <Button className="w-[152px] my-[14px]" size="medium">
          Explore
        </Button>
      </Link>
    </div>
  );
  return (
    <div className="my-daos">
      <div className="page-content-bg-border flex items-center justify-between py-[16px] lg:py-[24px]">
        <p className="text-Primary-Text text-[32px] leading-[40px] font-medium">My DAOs</p>
        <Link href="/create" className={isLG ? 'fix-bottom-button' : ''}>
          <Button type="primary">Create a DAO</Button>
        </Link>
      </div>
      <div className="flex flex-col mt-[24px]">
        <div className="flex flex-col ">
          <p className="list-header card-title-lg">My own DAOs</p>
          <div className="list-body">
            {ownLoading ? (
              <SkeletonDaoItemList />
            ) : (
              <>
                <p className="sub-title">Name</p>
                <ul className="list-body-content">
                  {!ownData?.list.length && EmptyNode}
                  {ownData?.list.map((item) => {
                    return (
                      <Link
                        key={item.daoId}
                        href={item.isNetworkDAO ? `/network-dao` : `/dao/${item.alias}`}
                      >
                        <li className="list-body-content-item" key={item.daoId}>
                          <img src={item.logo} alt="" />
                          <span className="normal-text-bold">{item.name}</span>
                        </li>
                      </Link>
                    );
                  })}
                </ul>
              </>
            )}
            {ownData?.hasData && (
              <div className="loading-more-wrap">
                <LoadMoreButton
                  onClick={() => {
                    wrapConnectCheck(ownLoadMore);
                  }}
                  loadingMore={ownLoadingMore}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col mt-[24px]">
          <p className="list-header card-title-lg">Participated DAOs</p>
          <div className="list-body">
            {participatedLoading ? (
              <SkeletonDaoItemList />
            ) : (
              <>
                <p className="sub-title">Name</p>
                <ul className="list-body-content">
                  {!participatedData?.list.length && EmptyNode}
                  {participatedData?.list.map((item) => {
                    return (
                      <Link
                        key={item.daoId}
                        href={item.isNetworkDAO ? `/network-dao` : `/dao/${item.alias}`}
                      >
                        <li className="list-body-content-item" key={item.daoId}>
                          <img src={item.logo} alt="" />
                          <span className="normal-text-bold">{item.name}</span>
                        </li>
                      </Link>
                    );
                  })}
                </ul>
              </>
            )}
            {participatedData?.hasData && (
              <div className="loading-more-wrap">
                <LoadMoreButton
                  onClick={() => {
                    wrapConnectCheck(participatedLoadMore);
                  }}
                  loadingMore={participatedLoadingMore}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default MyDaosPage;
