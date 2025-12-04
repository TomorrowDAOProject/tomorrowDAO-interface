'use client';
import React, { useEffect } from 'react';
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
import { useWalletService } from 'hooks/useWallet';
import { ReactComponent as VerifiedIcon } from 'assets/revamp-icon/verified.svg';

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

  console.log('participatedData?.list', participatedData?.list);

  const EmptyNode = (
    <div className="flex flex-col items-center">
      <NoData></NoData>
      <Link
        href="/explore"
        className="h-[32px] !py-2 !px-[14px] mt-[22px] !text-[12px] font-Montserrat font-medium text-white rounded-[42px] bg-mainColor hover:text-mainColor hover:bg-transparent hover:border hover:border-solid hover:border-mainColor"
      >
        Explore
      </Link>
    </div>
  );
  return (
    <div className="my-daos min-h-svh">
      <div className="mb-[15px] py-[25px] px-[30px] rounded-[8px] bg-darkBg border-fillBg8 border border-solid flex items-center justify-between">
        <p className="text-white text-[20px] leading-[40px] font-Unbounded">My DAOs</p>
        <Link
          href="/create"
          className="primary-button w-[117px] h-[32px] flex items-center gap-[6px] !py-2 !px-[14px]"
        >
          <span className="font-Montserrat text-[12px] font-medium">Create DAO</span>
          <i className="tmrwdao-icon-default-arrow text-[9px] text-inherit" />
        </Link>
      </div>
      <div className="flex flex-col rounded-[8px] bg-darkBg border-fillBg8 border border-solid overflow-hidden">
        <span className="list-header">My Own DAOs</span>
        <div className="list-body">
          {ownLoading ? (
            <SkeletonDaoItemList />
          ) : (
            <>
              <span className="text-lightGrey font-Montserrat text-[15px]">Name</span>
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
                        <span className="text-[14px] text-white font-Montserrat font-medium">
                          {item.name}
                        </span>
                        <i className="tmrwdao-icon-arrow text-[16px] text-white ml-auto" />
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
              <span className="text-lightGrey font-Montserrat text-[15px]">Name</span>
              <ul className="mt-4">
                {!participatedData?.list.length && EmptyNode}
                {participatedData?.list.map((item) => {
                  console.log('item', item);
                  return (
                    <Link
                      key={item.daoId}
                      href={item.isNetworkDAO ? `/network-dao` : `/dao/${item.alias}`}
                    >
                      <li className="list-body-content-item" key={item.daoId}>
                        <img src={item.logo} alt="" />
                        <span className="text-[14px] text-white font-Montserrat font-medium flex items-center gap-[14px]">
                          {item.name}
                          {/* <VerifiedIcon width={20} height={20} /> */}
                        </span>
                        <i className="tmrwdao-icon-arrow text-[16px] text-white ml-auto" />
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
