import { RightOutlined } from '@aelf-design/icons';
import Link from 'next/link';
import { fetchVoteHistory } from 'api/request';
import { useRequest } from 'ahooks';
import { curChain } from 'config';
import { EVoteOption } from 'types/vote';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import './index.css';
import { SkeletonLine } from 'components/Skeleton';
import NoData from 'components/NoData';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

interface IProps {
  daoId: string;
  isNetworkDAO?: boolean;
  aliasName?: string;
}
export default function MyRecords(props: IProps) {
  const { daoId, aliasName } = props;
  const { walletInfo: wallet } = useConnectWallet();

  const {
    data: voteHistoryData,
    run,
    // error: voteHistoryError,
    loading: voteHistoryLoading,
  } = useRequest(
    () => {
      return fetchVoteHistory({
        address: wallet!.address,
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
    if (wallet?.address) {
      run();
    }
  }, [run, wallet?.address]);

  const LoadMoreButton = (
    <span className="text-[12px] flex items-center gap-1 text-lightGrey hover:text-white font-Montserrat">
      <span>View More</span>
      <i className="tmrwdao-icon-arrow ml-auto"></i>
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
          {!dataLen && (
            <div className="text-lightGrey text-center font-Montserrat text-[12px]">
              No Results found
            </div>
          )}
          <div className="flex flex-col gap-[32px]">
            {voteHistoryData?.data?.items?.slice(0, 5)?.map((item, i) => {
              return (
                <div className="flex flex-col" key={i}>
                  <div className="mb-[4px] text-lightGrey font-Montserrat text-[11px]">
                    {dayjs(item.timeStamp).format('YYYY-MM-DD HH:mm:ss')}
                  </div>
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/dao/${aliasName}/proposal/${item.proposalId}`}
                      className="basis-3/4 truncate"
                    >
                      <span className="card-sm-text-bold text-white hover:link !text-[12px]">
                        {item.proposalTitle}
                      </span>
                    </Link>
                    <span
                      className={`pl-[4px] vote-${item.myOption} w-[76px] text-center border border-solid border-fillBg8`}
                    >
                      {EVoteOption[item.myOption].charAt(0).toUpperCase() +
                        EVoteOption[item.myOption].slice(1).toLowerCase()}
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
