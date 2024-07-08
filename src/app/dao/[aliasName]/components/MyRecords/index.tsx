import { Typography, FontWeightEnum, Button, HashAddress } from 'aelf-design';
import Image from 'next/image';
import { RightOutlined } from '@aelf-design/icons';
import Link from 'next/link';
import { fetchVoteHistory } from 'api/request';
import { useSelector } from 'react-redux';
import { useRequest } from 'ahooks';
import { curChain, explorer } from 'config';
import { EVoteOption } from 'types/vote';
import dayjs from 'dayjs';
import LinkNetworkDao from 'components/LinkNetworkDao';
import { useEffect } from 'react';
import { useWalletService } from 'hooks/useWallet';
import './index.css';
import { SkeletonLine } from 'components/Skeleton';
import { Empty } from 'antd';
import NoData from '../NoData';

interface IProps {
  daoId: string;
  isNetworkDAO?: boolean;
  aliasName?: string;
}
export default function MyRecords(props: IProps) {
  const { daoId, isNetworkDAO, aliasName } = props;
  const { walletInfo } = useSelector((store: any) => store.userInfo);
  const { isLogin } = useWalletService();
  const {
    data: voteHistoryData,
    run,
    // error: voteHistoryError,
    loading: voteHistoryLoading,
  } = useRequest(
    () => {
      return fetchVoteHistory({
        address: walletInfo.address,
        chainId: curChain,
        skipCount: 0,
        maxResultCount: 10,
        daoId,
      });
    },
    {
      manual: true,
    },
  );
  useEffect(() => {
    if (isLogin) {
      run();
    }
  }, [isLogin]);

  // const statusCom = (text: keyof IStatus, size = 500) => {
  //   return (
  //     <span
  //       style={{
  //         color: colorMap[text],
  //         fontWeight: size,
  //       }}
  //     >
  //       {text}
  //     </span>
  //   );
  // };

  const LoadMoreButton = (
    <span className="text-[12px] flex items-center text-neutralTitle hover:text-link">
      <span className="card-sm-text pr-[8px]">View More</span>
      <RightOutlined />
    </span>
  );
  const dataLen = voteHistoryData?.data?.items?.length ?? 0;
  return (
    <div className="page-content-bg-border mt-[16px] my-votes-wrap">
      <div className="flex justify-between items-center mb-[24px]">
        <div className="card-title ">My Votes</div>
        {dataLen > 5 && (
          <div className="records-header-morebtn">
            <Link href={`/dao/${aliasName}/my-votes`}>{LoadMoreButton}</Link>
          </div>
        )}
      </div>
      {voteHistoryLoading ? (
        <SkeletonLine />
      ) : (
        <>
          {!dataLen && <NoData />}
          <div className="flex flex-col gap-[32px]">
            {voteHistoryData?.data?.items?.slice(0, 5)?.map((item, i) => {
              return (
                <div className="flex flex-col" key={i}>
                  <div className="card-xsm-text mb-[4px] text-Neutral-Secondary-Text">
                    {dayjs(item.timeStamp).format('YYYY-MM-DD HH:mm:ss')}
                  </div>
                  <div className="flex justify-between items-center">
                    <Link href={`/proposal/${item.proposalId}`} className="basis-3/4 truncate">
                      <span className="card-sm-text-bold text-neutralPrimaryText hover:link">
                        {item.proposalTitle}
                      </span>
                    </Link>
                    <span className={`pl-[4px] vote-${item.myOption}`}>
                      {EVoteOption[item.myOption]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
