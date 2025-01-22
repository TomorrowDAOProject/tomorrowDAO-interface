'use client';
import React, { useEffect } from 'react';
import Button from 'components/Button';
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
import { ReactComponent as LinkIcon } from 'assets/revamp-icon/link.svg';
import { ReactComponent as ArrowRight } from 'assets/revamp-icon/arrow-right-white.svg';

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
        <Button className="h-[32px] !py-2 !px-[14px] mt-[20px] !text-[12px] font-Montserrat text-white border border-white border-solid">
          Explore
        </Button>
      </Link>
    </div>
  );
  return (
    <div className="my-daos">
      <div className="mb-[15px] py-[25px] px-[30px] rounded-[8px] bg-darkBg border-fillBg8 border border-solid flex items-center justify-between">
        <p className="text-white text-[20px] leading-[40px] font-Unbounded">My DAOs</p>
        <Link href="/create" className="primary-button flex items-center gap-2">
          <span className="font-Montserrat text-[12px]">Create DAO</span>
          <LinkIcon className="h-[11px] w-[11px]" />
        </Link>
      </div>
      <div className="flex flex-col rounded-[8px] bg-darkBg border-fillBg8 border border-solid overflow-hidden">
        <span className="list-header">My own DAOs</span>
        <div className="list-body">
          {ownLoading ? (
            <SkeletonDaoItemList />
          ) : (
            <>
              <span className="text-lightGrey text-Montserrat text-[15px]">Name</span>
              <ul className="mt-4">
                {!ownData?.list.length && EmptyNode}
                {ownData?.list.map((item) => {
                  return (
                    <Link
                      key={item.daoId}
                      href={item.isNetworkDAO ? `/network-dao` : `/dao/${item.alias}`}
                    >
                      <li className="list-body-content-item" key={item.daoId}>
                        <img src={item.logo} alt="" />
                        <span className="text-[14px] text-white font-Montserrat font-[500]">
                          {item.name}
                        </span>
                        <ArrowRight className="ml-auto" />
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
      <div className="flex flex-col mt-[25px] rounded-[8px] bg-darkBg border-fillBg8 border border-solid overflow-hidden">
        <span className="list-header">Participated DAOs</span>
        <div className="list-body">
          {participatedLoading ? (
            <SkeletonDaoItemList />
          ) : (
            <>
              <span className="text-lightGrey text-Montserrat text-[15px]">Name</span>
              <ul className="mt-4">
                {!participatedData?.list.length && EmptyNode}
                {participatedData?.list.map((item) => {
                  return (
                    <Link
                      key={item.daoId}
                      href={item.isNetworkDAO ? `/network-dao` : `/dao/${item.alias}`}
                    >
                      <li className="list-body-content-item" key={item.daoId}>
                        <img src={item.logo} alt="" />
                        <span className="text-[14px] text-white font-Montserrat font-[500]">
                          {item.name}
                        </span>
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
  );
};
export default MyDaosPage;
